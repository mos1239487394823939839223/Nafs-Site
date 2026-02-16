import axios from 'axios';

// Default API URL. Can be overridden by VITE_API_URL environment variable.
const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Configure request interceptor to include auth token if available
api.interceptors.request.use((config) => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
        try {
            const { token } = JSON.parse(storedAuth);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            // Ignore parsing errors
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Configure response interceptor to handle common errors
api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    // Handle 401 Unauthorized globally if needed
    if (error.response && error.response.status === 401) {
        // Optionally trigger logout or redirect
    }
    return Promise.reject(error);
});

// Authentication API Functions
export const authAPI = {
    // Login
    login: async (email, password) => {
        const response = await api.post('/Auth/login', {
            Email: email,
            Password: password,
        });
        return response.data;
    },

    // Logout
    logout: async () => {
        const response = await api.get('/Auth/logout');
        return response.data;
    },

    // Send OTP
    sendOtp: async (email) => {
        const response = await api.post('/Auth/SendOtp', {
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
};

export default api;
