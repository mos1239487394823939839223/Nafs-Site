import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMultiStepForm } from "../../../hooks/useMultiStepForm";
import { useAuth, Roles } from "../../../contexts/AuthContext";
import { useToast } from "../../../components/ui/Toast";
import ProgressStepper from "../../../components/forms/ProgressStepper";
import Button from "../../../components/ui/Button";
import Input, { Select, Textarea } from "../../../components/ui/Input";
import {
  validateRequired,
  validatePhone,
  validateDate,
  calculateAge,
  formatPhone,
  validateEmail,
} from "../../../lib/validation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  User,
  Heart,
  Shield,
} from "lucide-react";

import { api, authAPI } from "../../../lib/api";
import { useLanguage } from "../../../contexts/LanguageContext";

export default function PatientRegistration() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const steps = [
    { id: 1, title: t('auth.basicInfo'), subtitle: t('auth.personalDetails'), icon: User },
    { id: 2, title: t('auth.verification'), subtitle: t('auth.verifyEmail'), icon: Shield },
  ];

  const {
    currentStep,
    formData,
    errors,
    updateFormData,
    nextStep,
    previousStep,
    setFieldError,
    clearFieldError,
    isFirstStep,
    isLastStep,
  } = useMultiStepForm(
    {
      // Step 1
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      // Step 2
      otp: "",
    },
    2,
  );

  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Step 1 Validation
  const validateStep1 = () => {
    let isValid = true;

    if (!validateRequired(formData.firstName)) {
      setFieldError("firstName", t('errors.firstNameRequired'));
      isValid = false;
    }

    if (!validateRequired(formData.lastName)) {
      setFieldError("lastName", t('errors.lastNameRequired'));
      isValid = false;
    }

    if (!validateEmail(formData.email)) {
      setFieldError("email", t('errors.invalidEmail'));
      isValid = false;
    }

    if (!validateRequired(formData.password) || formData.password.length < 6) {
      setFieldError("password", t('errors.passwordTooShort'));
      isValid = false;
    }

    if (!validatePhone(formData.phone)) {
      setFieldError("phone", t('errors.invalidPhone'));
      isValid = false;
    }

    if (!validateDate(formData.dateOfBirth)) {
      setFieldError("dateOfBirth", t('errors.invalidDate'));
      isValid = false;
    } else {
      const age = calculateAge(formData.dateOfBirth);
      if (age < 13) {
        setFieldError("dateOfBirth", t('errors.minAge'));
        isValid = false;
      }
    }

    if (!validateRequired(formData.gender)) {
      setFieldError("gender", t('errors.selectGender'));
      isValid = false;
    }

    console.log("Step 1 validation result:", isValid, "Form data:", formData);
    return isValid;
  };

  // Step 3 - Send OTP
  const handleSendOTP = async () => {
    setLoading(true);
    console.group("🚀 Sending OTP Debug Info");
    console.log("Attempting to send OTP to:", formData.email);

    try {
      // Call API to send OTP (user must already be registered)
      const response = await authAPI.sendOtp(formData.email);

      console.log("📡 Server Response for SendOtp:", response);
      console.log("Status Code:", response?.status);
      console.log("IsSuccess:", response?.IsSuccess);
      console.log("Messages:", response?.Message);
      console.log("Data Payload:", response?.Data);

      if (response.IsSuccess) {
        console.log("✅ OTP sent successfully according to server");
        setOtpSent(true);
        setOtpTimer(60);
        toast.success(
          response.Data?.Message || t('success.otpSent'),
        );

        // Countdown timer
        const interval = setInterval(() => {
          setOtpTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        console.groupEnd();
        return true;
      } else {
        console.warn("⚠️ Server returned success=false for SendOtp");
        console.error("Error Message:", response.Message);
        toast.error(response.Message || t('errors.failedSendOtp'));
        console.groupEnd();
        return false;
      }
    } catch (error) {
      console.error("❌ Send OTP Request Failed:", error);
      if (error.response) {
        console.error("Response Data:", error.response.data);
        console.error("Response Status:", error.response.status);
        console.error("Response Headers:", error.response.headers);
      }
      toast.error(
        error.response?.data?.Message ||
        t('errors.failedSendOtp'),
      );
      console.groupEnd();
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setFieldError("otp", t('errors.otpRequired'));
      return false;
    }
    return true;
  };

  // Register user first (Step 1 completion)
  const handleRegisterUser = async () => {
    console.group("📝 Registration Process Started");
    console.log("Starting registration process...");
    setLoading(true);

    try {
      // Map gender to integer (1 = Male, 2 = Female per API spec)
      // If user selects "other", default to Male (1)
      const genderValue = formData.gender === "female" ? 2 : 1;

      // Clean phone number - remove + and spaces
      const cleanPhone = formData.phone.replace(/[\s+]/g, "");

      const payload = {
        Name: `${formData.firstName} ${formData.lastName}`,
        PhoneNumber: cleanPhone,
        Email: formData.email,
        Password: formData.password,
        Gender: genderValue,
        Birthday: new Date(formData.dateOfBirth).toISOString(),
      };

      console.log("📤 Registration Payload:", payload);

      const registerResponse = await api.post("/Auth/Register", payload);

      console.log("📡 Server Response for Registration:", registerResponse);
      console.log("Status Code:", registerResponse?.status);
      console.log("IsSuccess Property:", registerResponse?.data?.IsSuccess);
      console.log("Response Message:", registerResponse?.data?.Message);
      console.log("Response Details:", registerResponse?.data?.Details);

      // Check if response has an error message (backend error)
      if (
        registerResponse.data?.Message &&
        (registerResponse.data.Message.includes("error") ||
          registerResponse.data.Message.includes("Error"))
      ) {
        console.error(
          "❌ Registration failed with backend error:",
          registerResponse.data,
        );
        const errorMsg =
          registerResponse.data.Details ||
          registerResponse.data.Message ||
          t('errors.somethingWentWrong');
        toast.error(errorMsg);
        console.groupEnd();
        return;
      }

      if (
        registerResponse.data?.IsSuccess !== false &&
        registerResponse.status === 200
      ) {
        console.log("✅ Registration reported successful, proceeding to send OTP...");

        // Registration successful, now send OTP
        const otpSent = await handleSendOTP();
        console.log("OTP send function returned:", otpSent);

        // Only move to next step if OTP was sent successfully
        if (otpSent) {
          nextStep();
        } else {
          console.warn("⚠️ OTP failed to send after successful registration.");
        }
      } else {
        console.error(
          "❌ Registration failed (IsSuccess check):",
          registerResponse.data?.Message || registerResponse.data,
        );
        toast.error(registerResponse.data?.Message || t('errors.somethingWentWrong'));
      }
    } catch (error) {
      console.error("❌ Registration Threw Exception:", error);
      console.error("Error Response Data:", error.response?.data);
      console.error("Error Status:", error.response?.status);

      const errorMessage =
        error.response?.data?.Message ||
        error.response?.data?.message ||
        error.message ||
        t('errors.somethingWentWrong');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  const handleNext = async () => {
    try {
      let isValid = false;

      if (currentStep === 1) {
        isValid = validateStep1();
        if (isValid) {
          // Register user first, then send OTP
          await handleRegisterUser();
        } else {
          toast.error(t('errors.fixErrors'));
        }
      } else if (currentStep === 2) {
        isValid = validateStep2();
        if (isValid) {
          await handleSubmit();
        } else {
          toast.error(t('errors.fixErrors'));
        }
      }
    } catch (error) {
      console.error("Unexpected error in handleNext:", error);
      toast.error(t('errors.unexpectedError'));
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Verify OTP to activate account
      const otpResponse = await authAPI.verifyOtp(formData.email, formData.otp);

      if (!otpResponse.IsSuccess) {
        toast.error(otpResponse.Message || t('errors.failedVerifyOtp'));
        setLoading(false);
        return;
      }

      setLoading(false);

      // Registration and verification successful
      toast.success(t('success.registrationSuccess'));
      navigate("/auth/login");
    } catch (error) {
      console.error("OTP verification failed:", error);
      setLoading(false);
      const errorMessage =
        error.response?.data?.Message ||
        error.response?.data?.message ||
        error.message ||
        t('errors.failedVerifyOtp');
      toast.error(errorMessage);
    }
  };

  const handleFieldChange = (field, value) => {
    updateFormData({ [field]: value });
    clearFieldError(field);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background-paper to-background py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-background-paper/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-text-heading">
                      {t('auth.basicInformation')}
                    </h2>
                    <p className="text-sm text-text-muted">
                      {t('auth.tellUsAboutYourself')}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label={t('auth.firstName')}
                    value={formData.firstName}
                    onChange={(e) =>
                      handleFieldChange("firstName", e.target.value)
                    }
                    error={errors.firstName}
                    placeholder="Ahmed"
                  />
                  <Input
                    label={t('auth.lastName')}
                    value={formData.lastName}
                    onChange={(e) =>
                      handleFieldChange("lastName", e.target.value)
                    }
                    error={errors.lastName}
                    placeholder="Hassan"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <Input
                    label={t('auth.email')}
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    error={errors.email}
                    placeholder="you@example.com"
                  />
                  <Input
                    label={t('auth.password')}
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleFieldChange("password", e.target.value)
                    }
                    error={errors.password}
                    placeholder="••••••••"
                  />
                </div>

                <Input
                  label={t('auth.phoneNumber')}
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  error={errors.phone}
                  placeholder="+20 XXX XXX XXXX"
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label={t('auth.dateOfBirth')}
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      handleFieldChange("dateOfBirth", e.target.value)
                    }
                    error={errors.dateOfBirth}
                    max={new Date().toISOString().split("T")[0]}
                  />
                  <Select
                    label={t('common.gender')}
                    value={formData.gender}
                    onChange={(e) =>
                      handleFieldChange("gender", e.target.value)
                    }
                    error={errors.gender}
                  >
                    <option value="">{t('common.selectGender')}</option>
                    <option value="male">{t('common.male')}</option>
                    <option value="female">{t('common.female')}</option>
                    <option value="other">{t('common.other')}</option>
                  </Select>
                </div>

                {formData.dateOfBirth && validateDate(formData.dateOfBirth) && (
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <p className="text-sm text-primary">
                      {t('common.age')}: {calculateAge(formData.dateOfBirth)} {t('common.yearsOld')}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: OTP Verification */}
            {currentStep === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-clinical-darkGray">
                      {t('auth.emailVerification')}
                    </h2>
                    <p className="text-sm text-clinical-gray">
                      {t('auth.verifyYourEmail')}
                    </p>
                  </div>
                </div>

                <div className="bg-primary/10 p-6 rounded-lg text-center">
                  <p className="text-text-heading mb-2">
                    {t('auth.verificationSentTo')}
                  </p>
                  <p className="text-xl font-semibold text-primary">
                    {formData.email}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-heading mb-2">
                      {t('auth.enter6Digit')}
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.otp}
                      onChange={(e) =>
                        handleFieldChange(
                          "otp",
                          e.target.value.replace(/\D/g, ""),
                        )
                      }
                      className={`w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text ${errors.otp ? "border-red-500" : "border-border"
                        }`}
                      placeholder="000000"
                    />
                    {errors.otp && (
                      <p className="mt-1 text-sm text-red-500">{errors.otp}</p>
                    )}
                  </div>

                  <div className="text-center">
                    {otpTimer > 0 ? (
                      <p className="text-sm text-clinical-gray">
                        {t('auth.resendIn')}{" "}
                        <span className="font-semibold text-medical-blue">
                          {otpTimer}s
                        </span>
                      </p>
                    ) : (
                      <button
                        onClick={handleSendOTP}
                        className="text-sm text-primary hover:underline"
                      >
                        {t('auth.resendOtp')}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={previousStep}
              disabled={isFirstStep || loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Button>

            <Button onClick={handleNext} disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('common.processing')}</span>
                </div>
              ) : isLastStep ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t('auth.completeRegistration')}
                </>
              ) : (
                <>
                  {t('common.next')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
