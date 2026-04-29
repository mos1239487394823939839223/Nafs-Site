import axios from "axios";

// Default API URL. Can be overridden by VITE_BASE_URL environment variable.
const API_BASE_URL =
  import.meta.env.VITE_BASE_URL || "https://api.nafas-site.tech/";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper: Get clean token from localStorage (strips "Bearer " if present)
const getAuthToken = () => {
  try {
    const storedAuth = localStorage.getItem("auth");
    if (!storedAuth) return null;

    const parsed = JSON.parse(storedAuth);
    let token = parsed.token;

    if (!token) return null;

    // Strip "Bearer " prefix if accidentally stored with it
    if (
      typeof token === "string" &&
      token.toLowerCase().startsWith("bearer ")
    ) {
      token = token.substring(7).trim();
    }

    return token || null;
  } catch {
    return null;
  }
};

// Configure request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (
      import.meta.env.DEV &&
      config.url?.toLowerCase() === "/user/updateimage"
    ) {
      const imageLength = config.data?.Image?.length || 0;
      console.debug("[API] PUT /user/UpdateImage", {
        baseURL: config.baseURL,
        hasId: Boolean(config.data?.Id),
        imageLength,
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Configure response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized globally
    if (error.response && error.response.status === 401) {
      // Don't redirect if we're already on a login/auth page or making auth requests
      const requestUrl = error.config?.url || "";
      const isAuthRequest = requestUrl.includes("/Auth/");

      if (!isAuthRequest) {
        const storedAuth = localStorage.getItem("auth");
        if (storedAuth) {
          localStorage.removeItem("auth");
          window.location.href = "/auth/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

// ─── Error Message Extractor ─────────────────────────────────────────────────
/**
 * Extracts a human-readable error message from an Axios error or API response.
 * Tries all known backend response shapes before falling back.
 *
 * @param {any} error - The caught error (Axios error or unknown)
 * @param {string} fallback - Fallback message if nothing found
 * @returns {string}
 */
export const extractErrorMessage = (
  error,
  fallback = "Something went wrong",
) => {
  // 1. Backend returned a response (4xx / 5xx HTTP error)
  const data = error?.response?.data;
  if (data) {
    // Most common: { Message: "..." } or { message: "..." }
    if (data.Message && typeof data.Message === "string") return data.Message;
    if (data.message && typeof data.message === "string") return data.message;
    // Validation errors array: { errors: ["...", "..."] }
    if (Array.isArray(data.errors) && data.errors.length) return data.errors[0];
    if (Array.isArray(data.Messages) && data.Messages.length)
      return data.Messages[0];
    // Plain string body
    if (typeof data === "string" && data.length < 300) return data;
  }
  // 2. Network / timeout error
  if (error?.message) return error.message;
  return fallback;
};

// ─── Authentication API Functions ────────────────────────────────────────────
export const authAPI = {
  // Login
  login: async (email, password) => {
    const response = await api.post("/Auth/login", {
      Email: email,
      Password: password,
    });
    return response.data;
  },

  // Register (patient registration)
  register: async (data) => {
    const response = await api.post("/Auth/Register", data);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.get("/Auth/logout");
    return response.data;
  },

  // Send OTP (alias for ResendOtp - same endpoint)
  sendOtp: async (email) => {
    const response = await api.post("/Auth/ResendOtp", {
      Email: email,
    });
    return response.data;
  },

  // Resend OTP (60 second cooldown)
  resendOtp: async (email) => {
    const response = await api.post("/Auth/ResendOtp", {
      Email: email,
    });
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (email, otpCode) => {
    const response = await api.post("/Auth/VerifyOtp", {
      Email: email,
      OtpCode: otpCode,
    });
    return response.data;
  },

  // Forgot Password - sends OTP to email
  forgotPassword: async (email) => {
    const response = await api.post("/Auth/ForgotPassword", {
      Email: email,
    });
    return response.data;
  },

  // Confirm OTP for password change - returns a token
  confirmOTPForChangePassword: async (email, otpCode) => {
    const response = await api.post("/Auth/ConfirmOTPForChangePassword", {
      Email: email,
      OtpCode: otpCode,
    });
    return response.data;
  },

  // Change password by token (after forgot password flow)
  changePasswordByToken: async (token, password) => {
    const response = await api.post("/Auth/ChangePasswordByToken", {
      Token: token,
      Password: password,
    });
    return response.data;
  },
};

// ─── User API Functions ──────────────────────────────────────────────────────
export const userAPI = {
  // Resolve user id from different backend/frontend naming conventions
  resolveUserId: (user) => {
    const directId =
      user?.ID ||
      user?.Id ||
      user?.id ||
      user?.UserID ||
      user?.UserId ||
      user?.userId ||
      user?.PatientID ||
      user?.PatientId ||
      user?.patientId;
    if (directId) return directId;

    try {
      const storedAuth = localStorage.getItem("auth");
      if (!storedAuth) return null;
      const parsed = JSON.parse(storedAuth);
      return (
        parsed?.user?.ID ||
        parsed?.user?.Id ||
        parsed?.user?.id ||
        parsed?.user?.UserID ||
        parsed?.user?.UserId ||
        parsed?.user?.userId ||
        parsed?.user?.PatientID ||
        parsed?.user?.PatientId ||
        parsed?.user?.patientId ||
        null
      );
    } catch {
      return null;
    }
  },

  // Get current user info
  getCurrentUser: async () => {
    const response = await api.get("/user/GetCurrent");
    return response.data;
  },

  // Get users list (paginated, with filters)
  getUsers: async (params = {}) => {
    const response = await api.get("/user/get", {
      params: {
        PageIndex: params.pageIndex || 1,
        PageSize: params.pageSize || 10,
        ...(params.name && { Name: params.name }),
        ...(params.userName && { UserName: params.userName }),
        ...(params.email && { Email: params.email }),
        ...(params.role !== undefined && { Role: params.role }),
      },
    });
    return response.data;
  },

  // Edit main info and optional profile fields
  editMainInfo: async (data) => {
    const birthday = data.birthday || data.Birthday || null;
    const specialist = data.specialist || data.Specialist || null;
    const sessionPrice = data.sessionPrice ?? data.SessionPrice;
    const gender = data.gender ?? data.Gender;

    const response = await api.put("/user/EditMainInfo", {
      Name: data.name || data.Name || null,
      PhoneNumber: data.phoneNumber || data.PhoneNumber || null,
      Email: data.email || data.Email || null,
      Description: data.description || data.Description || null,
      Specialist: Array.isArray(specialist) ? specialist : null,
      Birthday: birthday ? new Date(birthday).toISOString() : null,
      Gender:
        gender === null || gender === undefined || gender === ""
          ? null
          : Number(gender),
      SessionPrice:
        sessionPrice === null ||
        sessionPrice === undefined ||
        sessionPrice === ""
          ? null
          : Number(sessionPrice),
    });
    return response.data;
  },

  // Update user profile image
  updateImage: async (id, imageBase64) => {
    const response = await api.put("/user/UpdateImage", {
      Id: id,
      Image: imageBase64,
    });
    return response.data;
  },

  // Update current user profile image regardless of role object shape
  updateCurrentUserImage: async (user, imageBase64) => {
    const userId = userAPI.resolveUserId(user);
    if (!userId) {
      throw new Error("USER_ID_NOT_FOUND");
    }
    return userAPI.updateImage(userId, imageBase64);
  },

  // Update language preference
  updateLang: async (language) => {
    const response = await api.put("/User/UpdateLang", null, {
      params: { Language: language },
    });
    return response.data;
  },

  // Change password (authenticated user)
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put("/user/ChangePassword", {
      CurrentPassword: currentPassword,
      NewPassword: newPassword,
    });
    return response.data;
  },

  // Reset password (admin)
  resetPassword: async (password, userId) => {
    const response = await api.post("/user/ResetPassword", {
      Password: password,
      UserID: userId,
    });
    return response.data;
  },

  // Get roles list
  getRoles: async () => {
    const response = await api.get("/role/GetList");
    return response.data;
  },
};

// ─── Patient API Functions ───────────────────────────────────────────────────
export const patientAPI = {
  // Get all doctors with pagination
  getAllDoctors: async (pageIndex = 1, pageSize = 10, hasSlotsOnly = false) => {
    const response = await api.get("/Patient/GetAllDoctors", {
      params: {
        PageIndex: pageIndex,
        PageSize: pageSize,
        ...(hasSlotsOnly && { HasSlotsOnly: true }),
      },
    });
    return response.data;
  },

  // Get doctor by ID
  getDoctorById: async (doctorId) => {
    const response = await api.get("/Patient/GetDoctorById", {
      params: {
        DoctorId: doctorId,
      },
    });
    return response.data;
  },

  // Get Doctor Slots
  getDoctorSlots: async (doctorId, startDate, endDate) => {
    const response = await api.get(`/Patient/Doctor/${doctorId}/Slots`, {
      params: {
        StartDate: startDate,
        EndDate: endDate,
      },
    });
    return response.data;
  },

  // Create Booking
  createBooking: async (bookingData) => {
    const response = await api.post("/Patient/Booking", bookingData);
    return response.data;
  },

  // Get Patient Bookings
  getPatientBookings: async (pageIndex = 1, pageSize = 10, status = null) => {
    const params = {
      PageIndex: pageIndex,
      PageSize: pageSize,
    };
    if (status !== null && status !== undefined) {
      params.Status = status;
    }
    const response = await api.get("/Patient/Bookings", { params });
    return response.data;
  },

  // Cancel Booking
  cancelBooking: async (bookingId, reason = null) => {
    const response = await api.post(`/Patient/Booking/${bookingId}/Cancel`, {
      CancellationReason: reason,
    });
    return response.data;
  },

  // Add Doctor Review
  addDoctorReview: async (reviewData) => {
    // reviewData should contain { DoctorId: 0, Rate: 0, Comment: "string" }
    const response = await api.post("/Doctor/AddReview", reviewData);
    return response.data;
  },
};

// ─── Doctor API Functions ────────────────────────────────────────────────────
export const doctorAPI = {
  // Get doctor bookings with pagination and optional status filter
  getBookings: async (pageIndex = 1, pageSize = 20, status = null) => {
    const params = {
      PageIndex: pageIndex,
      PageSize: pageSize,
    };
    if (status !== null && status !== undefined) {
      params.Status = status;
    }
    const response = await api.get("/Doctor/Bookings", { params });
    return response.data;
  },

  // Get doctor earnings overview with paginated transactions
  getEarnings: async (pageIndex = 1, pageSize = 20) => {
    const response = await api.get("/Doctor/Earnings", {
      params: { pageIndex, pageSize },
    });
    return response.data;
  },

  // Update booking status by id (Doctor endpoint)
  updateBookingStatus: async (bookingId, newStatus) => {
    const response = await api.put(`/Doctor/Booking/${bookingId}/Status`, {
      NewStatus: Number(newStatus),
    });
    return response.data;
  },

  // Cancel booking (backend authorization decides if doctor can cancel)
  cancelBooking: async (bookingId, reason = null) => {
    const response = await api.post(`/Doctor/Booking/${bookingId}/Cancel`, {
      CancellationReason: reason,
    });
    return response.data;
  },

  // Get doctor availability list
  getAvailability: async () => {
    const response = await api.get("/Doctor/Availability");
    return response.data;
  },

  // Set weekly schedule
  setWeeklySchedule: async (schedules) => {
    const response = await api.post("/Doctor/Availability/Weekly", {
      Schedules: schedules,
    });
    return response.data;
  },

  // Delete availability by id
  deleteAvailability: async (id) => {
    const response = await api.delete(`/Doctor/Availability/${id}`);
    return response.data;
  },

  // Block a time slot
  blockTime: async (specificDate, startTime, endTime) => {
    const response = await api.post("/Doctor/Availability/Block", {
      SpecificDate: specificDate,
      StartTime: startTime,
      EndTime: endTime,
    });
    return response.data;
  },

  // Add a specific time slot
  addTimeSlot: async (
    specificDate,
    startTime,
    endTime,
    slotDuration,
    sessionFee = null,
  ) => {
    const payload = {
      SpecificDate: specificDate,
      StartTime: startTime,
      EndTime: endTime,
      SlotDuration: slotDuration,
    };

    if (sessionFee !== null && sessionFee !== undefined && sessionFee !== "") {
      payload.SessionFee = Math.max(0, Number(sessionFee) || 0);
    }

    const response = await api.post("/Doctor/Availability/Slot", payload);
    return response.data;
  },

  // Add or update booking note
  addBookingNote: async (bookingId, note) => {
    const response = await api.post(`/Doctor/Booking/${bookingId}/Note`, {
      Note: note,
    });
    return response.data;
  },
};

// ─── Admin API Functions ─────────────────────────────────────────────────────
export const adminAPI = {
  // Get all doctors (admin view)
  getDoctors: async (pageIndex = 1, pageSize = 20, isActive = null) => {
    const params = {
      PageIndex: pageIndex,
      PageSize: pageSize,
    };
    if (isActive !== null && isActive !== undefined) {
      params.IsActive = isActive;
    }
    const response = await api.get("/Admin/GetDoctors", { params });
    return response.data;
  },

  // Add a new doctor
  addDoctor: async (doctorData) => {
    const response = await api.post("/Admin/AddDoctor", {
      Name: doctorData.name,
      Email: doctorData.email,
      Password: doctorData.password,
      PhoneNumber: doctorData.phoneNumber,
      Description: doctorData.description || null,
      Specialist: doctorData.specialist || null,
    });
    return response.data;
  },

  // Update doctor info
  updateDoctor: async (id, doctorData) => {
    const response = await api.put(`/Admin/Doctor/${id}`, {
      Name: doctorData.name || null,
      Email: doctorData.email || null,
      PhoneNumber: doctorData.phoneNumber || null,
      Description: doctorData.description || null,
      Specialist: doctorData.specialist || null,
    });
    return response.data;
  },

  // Toggle doctor active status
  toggleDoctor: async (id) => {
    const response = await api.post(`/Admin/Doctor/${id}/Toggle`);
    return response.data;
  },

  getDoctorEarnings: async (doctorId, pageIndex = 1, pageSize = 20) => {
    const response = await api.get(`/Admin/Doctor/${doctorId}/Earnings`, {
      params: { pageIndex, pageSize },
    });
    return response.data;
  },

  getDoctorPayouts: async (doctorId, pageIndex = 1, pageSize = 20) => {
    const response = await api.get(`/Admin/Doctor/${doctorId}/Payouts`, {
      params: { pageIndex, pageSize },
    });
    return response.data;
  },

  createDoctorPayout: async (doctorId, payload) => {
    const response = await api.post(`/Admin/Doctor/${doctorId}/Payout`, {
      Amount: Number(payload.amount),
      Notes: payload.notes || null,
    });
    return response.data;
  },

  // Get all bookings (admin view)
  getBookings: async (params = {}) => {
    const queryParams = {
      PageIndex: params.pageIndex || 1,
      PageSize: params.pageSize || 20,
    };
    if (params.doctorId) queryParams.DoctorId = params.doctorId;
    if (params.status !== undefined && params.status !== null)
      queryParams.Status = params.status;
    if (params.paymentStatus !== undefined && params.paymentStatus !== null)
      queryParams.PaymentStatus = params.paymentStatus;
    if (params.startDate) queryParams.StartDate = params.startDate;
    if (params.endDate) queryParams.EndDate = params.endDate;

    const response = await api.get("/Admin/Bookings", { params: queryParams });
    return response.data;
  },

  getPaymentInstructions: async (provider = null) => {
    const params = {};
    if (provider !== null && provider !== undefined && provider !== "") {
      params.provider = provider;
    }
    const response = await api.get("/PaymentInstructions", { params });
    return response.data;
  },

  createPaymentInstruction: async (payload) => {
    const response = await api.post("/Admin/PaymentInstructions", payload);
    return response.data;
  },

  updatePaymentInstruction: async (id, payload) => {
    const response = await api.put(`/Admin/PaymentInstructions/${id}`, payload);
    return response.data;
  },

  deletePaymentInstruction: async (id) => {
    const response = await api.delete(`/Admin/PaymentInstructions/${id}`);
    return response.data;
  },

  // Add any user (staff, admin, etc.) — Role: 1=Admin, 2=Doctor, 3=Patient, 4=Staff
  addUser: async (userData) => {
    const response = await api.post("/Admin/AddUser", {
      Name: userData.name,
      Email: userData.email,
      Password: userData.password,
      PhoneNumber: userData.phoneNumber || null,
      Role: userData.role,
      Description: userData.description || null,
      IsBullyingSpecialist: userData.isBullyingSpecialist ?? false,
    });
    return response.data;
  },
};

// ─── Chat API Constants ──────────────────────────────────────────────────────
export const MessageType = {
  Text: 1,
  System: 2,
  Attachment: 3,
};

// ─── Chat API Functions ──────────────────────────────────────────────────────
export const chatAPI = {
  // Get all chat rooms
  getRooms: async () => {
    const response = await api.get("/Chat/Rooms");
    return response.data;
  },

  // Open patient technical support chat room
  openPatientSupportChat: async (patientId, chatType) => {
    const parsedPatientId = Number(patientId);
    const patientIdValue =
      Number.isFinite(parsedPatientId) && String(patientId).trim() !== ""
        ? parsedPatientId
        : patientId;

    const chatTypeValue =
      chatType != null && Number.isFinite(Number(chatType)) ? Number(chatType) : 2;

    try {
      const response = await api.post("/CustomerSupport/Chat", {
        patientId: patientIdValue,
        PatientId: patientIdValue,
        ChatType: chatTypeValue,
      });
      const payload = response.data;
      const message = String(payload?.Message || payload?.message || "");
      const errorCode = Number(payload?.ErrorCode ?? payload?.errorCode);
      const failed = payload?.IsSuccess === false || payload?.isSuccess === false;
      const unauthorizedByBody =
        failed &&
        (errorCode === 531 ||
          message.includes("غير مصرح") ||
          message.toLowerCase().includes("not authorized"));

      if (!unauthorizedByBody) {
        return payload;
      }

      const fallback = await api.post("/Patient/Support/Chat", { ChatType: chatTypeValue });
      return fallback.data;
    } catch (error) {
      // Some deployments restrict this endpoint to support roles only.
      // For patient tokens, fallback to the dedicated patient endpoint.
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        const fallback = await api.post("/Patient/Support/Chat", { ChatType: chatTypeValue });
        return fallback.data;
      }
      throw error;
    }
  },

  // Backward-compatible alias for existing callers
  createOrGetPatientSupportRoom: async (patientId) => {
    return chatAPI.openPatientSupportChat(patientId);
  },

  // Get messages for a specific room (paginated)
  getRoomMessages: async (roomId, pageIndex = 1, pageSize = 50) => {
    const response = await api.get(`/Chat/Room/${roomId}/Messages`, {
      params: {
        PageIndex: pageIndex,
        PageSize: pageSize,
      },
    });
    return response.data;
  },

  // Send a message to a room
  sendMessage: async (
    roomId,
    content,
    messageType = MessageType.Text,
    attachmentUrl = null,
    attachmentName = null,
  ) => {
    const response = await api.post(`/Chat/Room/${roomId}/Message`, {
      Content: content,
      MessageType: messageType,
      AttachmentUrl: attachmentUrl,
      AttachmentName: attachmentName,
    });
    return response.data;
  },

  // Mark messages in a room as read
  markAsRead: async (roomId) => {
    const response = await api.post(`/Chat/Room/${roomId}/MarkAsRead`);
    return response.data;
  },
};

// ─── Blog API Functions ──────────────────────────────────────────────────────
export const blogAPI = {
  getBlogs: async (pageIndex = 1, pageSize = 20, tagId = null) => {
    const params = { pageIndex, pageSize };
    if (tagId !== null && tagId !== undefined) params.tagId = tagId;
    const response = await api.get("/blog/blogs", { params });
    return response.data;
  },

  getPersonalizedBlogs: async (pageIndex = 1, pageSize = 20) => {
    const response = await api.get("/blog/blogs/personalized", {
      params: { pageIndex, pageSize },
    });
    return response.data;
  },

  getBlogById: async (blogId) => {
    const response = await api.get(`/blog/blogs/${blogId}`);
    return response.data;
  },

  createBlog: async (payload) => {
    const response = await api.post("/blog/blogs", payload);
    return response.data;
  },

  updateBlog: async (blogId, payload) => {
    const response = await api.put(`/blog/blogs/${blogId}`, payload);
    return response.data;
  },

  deleteBlog: async (blogId) => {
    const response = await api.delete(`/blog/blogs/${blogId}`);
    return response.data;
  },

  getTags: async () => {
    const response = await api.get("/blog/tags");
    return response.data;
  },

  createTag: async (name) => {
    const response = await api.post("/blog/tags", { Name: name });
    return response.data;
  },

  getPreferredTags: async () => {
    const response = await api.get("/blog/my-preferred-tags");
    return response.data;
  },

  setPreferredTags: async (tagIds) => {
    const response = await api.put("/blog/my-preferred-tags", {
      TagIDs: tagIds,
    });
    return response.data;
  },
};

// ─── Medical API Functions ───────────────────────────────────────────────────
export const medicalAPI = {
  getDiseases: async (pageIndex = 1, pageSize = 50, name = "") => {
    const params = { pageIndex, pageSize };
    if (name && String(name).trim()) {
      params.name = String(name).trim();
    }

    const response = await api.get("/Medical/Diseases", { params });
    return response.data;
  },

  createDisease: async (payload) => {
    const response = await api.post("/Medical/Diseases", payload);
    return response.data;
  },

  getTestTypes: async (pageIndex = 1, pageSize = 50, diseaseId = null) => {
    const params = { pageIndex, pageSize };
    if (diseaseId !== null && diseaseId !== undefined && diseaseId !== "") {
      params.diseaseId = diseaseId;
    }

    const response = await api.get("/medical/test-types", {
      params,
    });
    return response.data;
  },

  createTestType: async (payload) => {
    const response = await api.post("/medical/test-types", payload);
    return response.data;
  },

  getMyHistory: async (pageIndex = 1, pageSize = 20) => {
    const response = await api.get("/medical/my-history", {
      params: { pageIndex, pageSize },
    });
    return response.data;
  },

  getPatientHistory: async (patientId, pageIndex = 1, pageSize = 20) => {
    const response = await api.get(`/medical/patients/${patientId}/history`, {
      params: { pageIndex, pageSize },
    });
    return response.data;
  },

  addPatientTest: async (payload) => {
    const response = await api.post("/medical/patient-tests", payload);
    return response.data;
  },

  updatePatientTestResult: async (recordId, result) => {
    const response = await api.put(
      `/medical/patient-tests/${recordId}/result`,
      {
        Result: result,
      },
    );
    return response.data;
  },

  getTestTypeDiseases: async (testTypeId) => {
    const response = await api.get(`/Medical/TestTypes/${testTypeId}/Diseases`);
    return response.data;
  },
};

// ─── Documents API Functions ─────────────────────────────────────────────────
export const documentsAPI = {
  uploadDocument: async ({ file, ownerUserId, title, documentType = 1 }) => {
    // Backend expects JSON metadata for /documents/upload, not multipart.
    // Upload binary first, then send file URL + metadata.
    const uploadResponse = await filesAPI.uploadFile(file);
    const fileUrl = uploadResponse?.Data?.PublicUrl;
    const fileName = uploadResponse?.Data?.FileName || file?.name || title;
    const normalizedDocumentType = Number(documentType);

    if (!fileUrl) {
      throw new Error("DOCUMENT_FILE_UPLOAD_FAILED");
    }

    const response = await api.post("/documents/upload", {
      OwnerUserID: ownerUserId,
      Title: title || fileName,
      DocumentType: [1, 2, 3].includes(normalizedDocumentType)
        ? normalizedDocumentType
        : 1,
      FileUrl: fileUrl,
      FileName: fileName,
    });
    return response.data;
  },

  getDocumentsByOwner: async (ownerUserId, pageIndex = 1, pageSize = 20) => {
    const response = await api.get(`/documents/${ownerUserId}`, {
      params: { pageIndex, pageSize },
    });
    return response.data;
  },

  deleteDocument: async (documentId) => {
    const response = await api.delete(`/documents/${documentId}`);
    return response.data;
  },
};

// ─── Files API Functions ─────────────────────────────────────────────────────
export const filesAPI = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Normalize PublicUrl to absolute URL if the backend returns a relative path
    if (response.data?.Data?.PublicUrl?.startsWith("/")) {
      const base = API_BASE_URL.replace(/\/$/, "");
      response.data.Data.PublicUrl = `${base}${response.data.Data.PublicUrl}`;
    }

    return response.data;
  },
};

// ─── Payment API Functions ───────────────────────────────────────────────────
export const paymentAPI = {
  initiatePayment: async (payload) => {
    const response = await api.post("/Patient/Payment/Initiate", payload);
    return response.data;
  },

  submitManualPayment: async (payload) => {
    const response = await api.post("/Payment/Manual", payload);
    return response.data;
  },

  getProviders: async () => {
    const response = await api.get("/Payment/Providers");
    return response.data;
  },

  getPaymentInstructions: async (provider = null) => {
    const params = {};
    if (provider !== null && provider !== undefined && provider !== "") {
      params.provider = provider;
    }
    const response = await api.get("/PaymentInstructions", { params });
    return response.data;
  },

  getPaymentStatus: async (bookingId) => {
    const response = await api.get(`/Patient/Payment/${bookingId}/Status`);
    return response.data;
  },
};

// ─── Customer Support API Functions ─────────────────────────────────────────
export const customerSupportAPI = {
  getManualPayments: async (pageIndex = 1, pageSize = 20, status = null) => {
    const params = {
      pageIndex,
      pageSize,
    };

    if (status !== null && status !== undefined && status !== "") {
      params.status = status;
    }

    const response = await api.get("/CustomerSupport/ManualPayments", {
      params,
    });
    return response.data;
  },

  confirmManualPayment: async (id) => {
    const response = await api.put(
      `/CustomerSupport/ManualPayments/${id}/Confirm`,
    );
    return response.data;
  },

  rejectManualPayment: async (id, rejectionReason) => {
    const response = await api.put(
      `/CustomerSupport/ManualPayments/${id}/Reject`,
      {
        RejectionReason: rejectionReason || null,
      },
    );
    return response.data;
  },

  getRefunds: async (pageIndex = 1, pageSize = 20, status = null) => {
    const params = {
      page: pageIndex,
      pageSize,
    };

    if (status !== null && status !== undefined && status !== "") {
      params.status = status;
    }

    const response = await api.get("/CustomerSupport/Refunds", {
      params,
    });
    return response.data;
  },

  processRefund: async (id, notes = null) => {
    const response = await api.put(`/CustomerSupport/Refunds/${id}/Process`, {
      Notes: notes || null,
    });
    return response.data;
  },
};

// ─── Utility/Misc API Functions ──────────────────────────────────────────────
export const miscAPI = {
  sendEmail: async (payload) => {
    const response = await api.post("/Mail/sendEmail", payload);
    return response.data;
  },

  paymentCallbackFawry: async () => {
    const response = await api.post("/Payment/Callback/Fawry");
    return response.data;
  },

  paymentCallbackPaymob: async () => {
    const response = await api.post("/Payment/Callback/Paymob");
    return response.data;
  },
};

export default api;
