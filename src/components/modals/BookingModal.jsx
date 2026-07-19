import { useState, useEffect, useRef } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Badge from "../ui/Badge";
import DatePicker from "../ui/DatePicker";
import { Search, Calendar, Clock, Star, Loader2, Stethoscope } from "lucide-react";
import { patientAPI, extractErrorMessage } from "../../lib/api";
import { SESSION_DURATION_MINUTES, extractSlotDurationMinutes } from "../../lib/patientBookingSlots";
import { useToast } from "../ui/Toast";
import { useLanguage } from "../../contexts/LanguageContext";
import { getDoctorSpecialtyTheme } from "../../lib/doctorSpecialtyTheme";

export default function BookingModal({ isOpen, onClose }) {
  const { t, isRTL } = useLanguage();
  const toast = useToast();
  const [step, setStep] = useState(1); // 1: Select Doctor, 2: Select Time, 3: Confirm
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSlotDuration, setSelectedSlotDuration] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const bookingInFlightRef = useRef(false);

  // Fetch doctors when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
    }
  }, [isOpen]);

  // Fetch available slots when doctor and date change
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await patientAPI.getAllDoctors(1, 50);
      if (response?.IsSuccess === true && response?.Data) {
        const items = response.Data.Items || response.Data || [];
        setDoctors(Array.isArray(items) ? items : []);
      }
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    try {
      setSlotsLoading(true);
      const doctorId = selectedDoctor?.Id || selectedDoctor?.id;
      const response = await patientAPI.getDoctorSlots(
        doctorId,
        selectedDate,
        selectedDate,
      );
      if (response?.IsSuccess === true && response?.Data) {
        const slotsData =
          response.Data.Slots ||
          response.Data.Items ||
          (Array.isArray(response.Data) ? response.Data : []);
        setAvailableSlots(Array.isArray(slotsData) ? slotsData : []);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Failed to fetch slots:", error);
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBooking = async () => {
    if (bookingInFlightRef.current) return;

    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast.error("Please select all booking details");
      return;
    }

    bookingInFlightRef.current = true;
    setBookingLoading(true);
    try {
      const doctorId = selectedDoctor?.Id || selectedDoctor?.id;
      const sessionStartTime = `${selectedDate}T${selectedTime}:00`;

      const bookingData = {
        DoctorId: doctorId,
        SessionStartTime: sessionStartTime,
        DurationMinutes:
          Number(selectedSlotDuration) > 0
            ? Number(selectedSlotDuration)
            : SESSION_DURATION_MINUTES,
      };

      const response = await patientAPI.createBooking(bookingData);

      if (response?.IsSuccess === true) {
        toast.success("Appointment booked successfully!");
        onClose();
        setStep(1);
        setSelectedDoctor(null);
        setSelectedDate("");
        setSelectedTime("");
      } else {
        toast.error(response?.Message || "Failed to book appointment");
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(extractErrorMessage(error, "Failed to book appointment"));
    } finally {
      bookingInFlightRef.current = false;
      setBookingLoading(false);
    }
  };

  // Generate time slots from available slots or use fallback
  const getTimeSlots = () => {
    if (availableSlots.length > 0) {
      return availableSlots.map((slot) => {
        const startRaw = slot.StartTime || slot.start || slot.SessionStartTime;
        const startDate = startRaw ? new Date(startRaw) : null;
        const time =
          startDate && !Number.isNaN(startDate.getTime())
            ? `${String(startDate.getHours()).padStart(2, "0")}:${String(startDate.getMinutes()).padStart(2, "0")}`
            : String(startRaw || "").slice(11, 16);
        const durationMinutes = extractSlotDurationMinutes(slot, {
          startTime: startDate,
        });
        return {
          slot,
          time,
          label: time,
          durationMinutes,
          available: !(slot.IsReserved ?? slot.IsBooked) && slot.IsAvailable !== false,
        };
      });
    }
    // Fallback time slots
    return [
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
    ].map((t) => ({ time: t, label: t, available: true }));
  };

  const timeSlots = getTimeSlots();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("patient.bookAppointment")}
      size="lg"
    >
      <div >
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 ${
                step >= 1 ? "text-primary" : "text-text-muted/50"
              } ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1
                    ? "bg-primary text-white"
                    : "bg-background-subtle text-text-muted"
                }`}
              >
                1
              </div>
              <span className="text-sm font-medium">
                {t("patient.selectDoctor", "Select Therapist")}
              </span>
            </div>
            <div className="w-12 h-0.5 bg-border/50"></div>
            <div
              className={`flex items-center gap-2 ${
                step >= 2 ? "text-primary" : "text-text-muted/50"
              } ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2
                    ? "bg-primary text-white"
                    : "bg-background-subtle text-text-muted"
                }`}
              >
                2
              </div>
              <span className="text-sm font-medium">
                {t("patient.selectTime", "Select Time")}
              </span>
            </div>
            <div className="w-12 h-0.5 bg-border/50"></div>
            <div
              className={`flex items-center gap-2 ${
                step >= 3 ? "text-primary" : "text-text-muted/50"
              } ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 3
                    ? "bg-primary text-white"
                    : "bg-background-subtle text-text-muted"
                }`}
              >
                3
              </div>
              <span className="text-sm font-medium">
                {t("patient.confirm", "Confirm")}
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Select Doctor */}
        {step === 1 && (
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-12">
                <Stethoscope className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-30" />
                <p className="text-text-muted">
                  {t("patient.noDoctorsFound", "No therapists available")}
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {doctors.map((doctor) => {
                  const doctorId = doctor.Id || doctor.id;
                  const doctorName =
                    doctor.Name || doctor.name || t("common.doctor");
                  const specialty =
                    doctor.Specialist?.join(", ") ||
                    doctor.specialty ||
                    t("common.general");
                  const fee = doctor.ConsultationFee || doctor.price || "N/A";
                  const specialtyTheme = getDoctorSpecialtyTheme(
                    doctor.Specialist || doctor.specialty || [],
                  );

                  return (
                    <div
                      key={doctorId}
                      onClick={() => setSelectedDoctor(doctor)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        (selectedDoctor?.Id || selectedDoctor?.id) === doctorId
                          ? `border-primary ${specialtyTheme.surface}`
                          : `border-border hover:border-primary ${specialtyTheme.surface}`
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-text-heading">
                            {t("common.dr", "Therapist")} {doctorName}
                          </h4>
                          <span
                            className={`inline-flex mt-1 text-xs px-2.5 py-1 rounded-full border ${specialtyTheme.badge}`}
                          >
                            {specialty}
                          </span>
                          {doctor.Description && (
                            <p className="text-xs text-text-muted mt-1 line-clamp-2">
                              {doctor.Description}
                            </p>
                          )}
                        </div>
                        <div className="text-end">
                          {fee !== "N/A" && (
                            <>
                              <p
                                className="text-2xl font-bold text-primary"
                                dir="ltr"
                              >
                                {fee} EGP
                              </p>
                              <p className="text-xs text-text-muted">
                                {t("patient.perSession", "per session")}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!selectedDoctor}>
                {t("common.next")}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Select Time */}
        {step === 2 && (
          <div>
            <div className="mb-6">
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={(val) => {
                  setSelectedDate(val);
                  setSelectedTime("");
                }}
                minDate={new Date()}
                placeholder="Pick a date…"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-heading mb-3">
                {t("patient.availableTimeSlots")}
              </label>
              {slotsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {timeSlots
                    .filter((s) => s.available)
                    .map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => {
                          setSelectedTime(slot.time);
                          setSelectedSlotDuration(slot.durationMinutes ?? null);
                        }}
                        className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                          selectedTime === slot.time
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary text-text-muted hover:text-text"
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                {t("common.back")}
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!selectedDate || !selectedTime}
              >
                {t("common.next")}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div>
            <div className="bg-background-subtle p-6 rounded-lg mb-6 border border-border">
              <h3 className="font-semibold text-text-heading mb-4">
                {t("patient.bookingSummary")}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-muted">{t("common.doctor")}:</span>
                  <span className="font-medium text-text-heading">
                    {t("common.dr", "Therapist")}{" "}
                    {selectedDoctor?.Name || selectedDoctor?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">
                    {t("common.specialty")}:
                  </span>
                  <span
                    className={`font-medium text-text-heading inline-flex rounded-full px-2.5 py-1 border ${
                      getDoctorSpecialtyTheme(
                        selectedDoctor?.Specialist ||
                          selectedDoctor?.specialty ||
                          [],
                      ).badge
                    }`}
                  >
                    {selectedDoctor?.Specialist?.join(", ") ||
                      selectedDoctor?.specialty ||
                      t("common.general")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">{t("common.date")}:</span>
                  <span className="font-medium text-text-heading" dir="ltr">
                    {selectedDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">{t("common.time")}:</span>
                  <span className="font-medium text-text-heading" dir="ltr">
                    {selectedTime}
                  </span>
                </div>
                {(selectedDoctor?.ConsultationFee || selectedDoctor?.price) && (
                  <div className="flex justify-between pt-3 border-t border-border">
                    <span className="text-text-muted">Total:</span>
                    <span className="text-2xl font-bold text-primary" dir="ltr">
                      {selectedDoctor?.ConsultationFee || selectedDoctor?.price}{" "}
                      EGP
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                {t("common.back")}
              </Button>
              <Button onClick={handleBooking} disabled={bookingLoading}>
                {bookingLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t("common.saving", "Booking...")}
                  </div>
                ) : (
                  t("patient.confirmAppointment")
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
