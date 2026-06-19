export function doctorMedicalRecordsUrl(patientId, { add = false, section } = {}) {
  const params = new URLSearchParams();
  if (patientId) params.set("patientId", String(patientId));
  if (add) params.set("add", "1");
  if (section) params.set("section", section);
  const query = params.toString();
  return query ? `/dashboard/doctor/medical-records?${query}` : "/dashboard/doctor/medical-records";
}

export function doctorMessagesUrl(patientId, bookingId) {
  const params = new URLSearchParams();
  if (patientId) params.set("patient", String(patientId));
  if (bookingId) params.set("bookingId", String(bookingId));
  const query = params.toString();
  return query ? `/dashboard/doctor/messages?${query}` : "/dashboard/doctor/messages";
}

export function doctorHistoryUrl({ tab = "records", patientId, bookingId, action } = {}) {
  const params = new URLSearchParams();
  if (tab) params.set("tab", tab);
  if (patientId) params.set("patientId", String(patientId));
  if (bookingId) params.set("bookingId", String(bookingId));
  if (action) params.set("action", action);
  const query = params.toString();
  return query ? `/dashboard/doctor/history?${query}` : "/dashboard/doctor/history";
}

export function doctorScheduleAddSlotUrl() {
  return "/dashboard/doctor/schedule?open=slot";
}
