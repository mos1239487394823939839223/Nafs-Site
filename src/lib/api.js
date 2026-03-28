import axios from 'axios';

// Default API URL. Can be overridden by VITE_BASE_URL environment variable.
const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://app.nafas-site.tech/';

export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper: Get clean token from localStorage (strips "Bearer " if present)
const getAuthToken = () => {
    try {
        const storedAuth = localStorage.getItem('auth');
        if (!storedAuth) return null;

        const parsed = JSON.parse(storedAuth);
        let token = parsed.token;

        if (!token) return null;

        // Strip "Bearer " prefix if accidentally stored with it
        if (typeof token === 'string' && token.toLowerCase().startsWith('bearer ')) {
            token = token.substring(7).trim();
        }

        return token || null;
    } catch {
        return null;
    }
};

// Configure request interceptor to include auth token if available
api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV && config.url?.toLowerCase() === '/user/updateimage') {
        const imageLength = config.data?.Image?.length || 0;
        console.debug('[API] PUT /user/UpdateImage', {
            baseURL: config.baseURL,
            hasId: Boolean(config.data?.Id),
            imageLength,
        });
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Configure response interceptor to handle common errors
api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    // Handle 401 Unauthorized globally
    if (error.response && error.response.status === 401) {
        // Don't redirect if we're already on a login/auth page or making auth requests
        const requestUrl = error.config?.url || '';
        const isAuthRequest = requestUrl.includes('/Auth/');

        if (!isAuthRequest) {
            localStorage.removeItem('auth');
            window.location.href = '/auth/login';
        }
    }
    return Promise.reject(error);
});

// ─── Authentication API Functions ────────────────────────────────────────────
export const authAPI = {
    // Login
    login: async (email, password) => {
        const response = await api.post('/Auth/login', {
            Email: email,
            Password: password,
        });
        return response.data;
    },

    // Register (patient registration)
    register: async (data) => {
        const response = await api.post('/Auth/Register', data);
        return response.data;
    },

    // Logout
    logout: async () => {
        const response = await api.get('/Auth/logout');
        return response.data;
    },

    // Send OTP (alias for ResendOtp - same endpoint)
    sendOtp: async (email) => {
        const response = await api.post('/Auth/ResendOtp', {
            Email: email,
        });
        return response.data;
    },

    // Resend OTP (60 second cooldown)
    resendOtp: async (email) => {
        const response = await api.post('/Auth/ResendOtp', {
            Email: email,
        });
        return response.data;
    },

    // Verify OTP
    verifyOtp: async (email, otpCode) => {
        const response = await api.post('/Auth/VerifyOtp', {
            Email: email,
            OtpCode: otpCode,
        });
        return response.data;
    },

    // Forgot Password - sends OTP to email
    forgotPassword: async (email) => {
        const response = await api.post('/Auth/ForgotPassword', {
            Email: email,
        });
        return response.data;
    },

    // Confirm OTP for password change - returns a token
    confirmOTPForChangePassword: async (email, otpCode) => {
        const response = await api.post('/Auth/ConfirmOTPForChangePassword', {
            Email: email,
            OtpCode: otpCode,
        });
        return response.data;
    },

    // Change password by token (after forgot password flow)
    changePasswordByToken: async (token, password) => {
        const response = await api.post('/Auth/ChangePasswordByToken', {
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
        const directId = user?.ID || user?.Id || user?.id;
        if (directId) return directId;

        try {
            const storedAuth = localStorage.getItem('auth');
            if (!storedAuth) return null;
            const parsed = JSON.parse(storedAuth);
            return parsed?.user?.ID || parsed?.user?.Id || parsed?.user?.id || null;
        } catch {
            return null;
        }
    },

    // Get current user info
    getCurrentUser: async () => {
        const response = await api.get('/user/GetCurrent');
        return response.data;
    },

    // Get users list (paginated, with filters)
    getUsers: async (params = {}) => {
        const response = await api.get('/user/get', {
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

    // Edit main info (name, username, phone, email)
    editMainInfo: async (data) => {
        const response = await api.put('/user/EditMainInfo', {
            Name: data.name || null,
            Username: data.username || null,
            PhoneNumber: data.phoneNumber || null,
            Email: data.email || null,
        });
        return response.data;
    },

    // Update user profile image
    updateImage: async (id, imageBase64) => {
        const response = await api.put('/user/UpdateImage', {
            Id: id,
            Image: imageBase64,
        });
        return response.data;
    },

    // Update current user profile image regardless of role object shape
    updateCurrentUserImage: async (user, imageBase64) => {
        const userId = userAPI.resolveUserId(user);
        if (!userId) {
            throw new Error('USER_ID_NOT_FOUND');
        }
        return userAPI.updateImage(userId, imageBase64);
    },

    // Update language preference
    updateLang: async (language) => {
        const response = await api.put('/User/UpdateLang', null, {
            params: { Language: language },
        });
        return response.data;
    },

    // Change password (authenticated user)
    changePassword: async (currentPassword, newPassword) => {
        const response = await api.put('/user/ChangePassword', {
            CurrentPassword: currentPassword,
            NewPassword: newPassword,
        });
        return response.data;
    },

    // Reset password (admin)
    resetPassword: async (password, userId) => {
        const response = await api.post('/user/ResetPassword', {
            Password: password,
            UserID: userId,
        });
        return response.data;
    },

    // Get roles list
    getRoles: async () => {
        const response = await api.get('/role/GetList');
        return response.data;
    },
};

// ─── Patient API Functions ───────────────────────────────────────────────────
export const patientAPI = {
    // Get all doctors with pagination
    getAllDoctors: async (pageIndex = 1, pageSize = 10) => {
        const response = await api.get('/Patient/GetAllDoctors', {
            params: {
                PageIndex: pageIndex,
                PageSize: pageSize,
            },
        });
        return response.data;
    },

    // Get doctor by ID
    getDoctorById: async (doctorId) => {
        const response = await api.get('/Patient/GetDoctorById', {
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
        const response = await api.post('/Patient/Booking', bookingData);
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
        const response = await api.get('/Patient/Bookings', { params });
        return response.data;
    },

    // Cancel Booking
    cancelBooking: async (bookingId, reason = null) => {
        const response = await api.post(`/Patient/Booking/${bookingId}/Cancel`, {
            CancellationReason: reason,
        });
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
        const response = await api.get('/Doctor/Bookings', { params });
        return response.data;
    },

    // Get doctor availability list
    getAvailability: async () => {
        const response = await api.get('/Doctor/Availability');
        return response.data;
    },

    // Set weekly schedule
    setWeeklySchedule: async (schedules) => {
        const response = await api.post('/Doctor/Availability/Weekly', {
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
        const response = await api.post('/Doctor/Availability/Block', {
            SpecificDate: specificDate,
            StartTime: startTime,
            EndTime: endTime,
        });
        return response.data;
    },

    // Add a specific time slot
    addTimeSlot: async (specificDate, startTime, endTime, slotDuration) => {
        const response = await api.post('/Doctor/Availability/Slot', {
            SpecificDate: specificDate,
            StartTime: startTime,
            EndTime: endTime,
            SlotDuration: slotDuration,
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
        const response = await api.get('/Admin/GetDoctors', { params });
        return response.data;
    },

    // Add a new doctor
    addDoctor: async (doctorData) => {
        const response = await api.post('/Admin/AddDoctor', {
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

    // Get all bookings (admin view)
    getBookings: async (params = {}) => {
        const queryParams = {
            PageIndex: params.pageIndex || 1,
            PageSize: params.pageSize || 20,
        };
        if (params.doctorId) queryParams.DoctorId = params.doctorId;
        if (params.status !== undefined && params.status !== null) queryParams.Status = params.status;
        if (params.startDate) queryParams.StartDate = params.startDate;
        if (params.endDate) queryParams.EndDate = params.endDate;

        const response = await api.get('/Admin/Bookings', { params: queryParams });
        return response.data;
    },
};

// ─── Chat API Functions ──────────────────────────────────────────────────────
export const chatAPI = {
    // Get all chat rooms
    getRooms: async () => {
        const response = await api.get('/Chat/Rooms');
        return response.data;
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
    sendMessage: async (roomId, content, messageType = 0, attachmentUrl = null, attachmentName = null) => {
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

export default api;
