import { createContext, useContext, useState, useEffect } from "react";
import { authAPI, userAPI } from "../lib/api";

// Role definitions
export const Roles = {
  PATIENT: "patient",
  DOCTOR: "doctor",
  ADMIN: "admin",
  STAFF: "staff",
};

// Role display names
export const RoleNames = {
  [Roles.PATIENT]: "Patient",
  [Roles.DOCTOR]: "Therapist",
  [Roles.ADMIN]: "Admin",
  [Roles.STAFF]: "Customer Service",
};

// Role-specific dashboard routes
export const RoleDashboards = {
  [Roles.PATIENT]: "/dashboard/patient",
  [Roles.DOCTOR]: "/dashboard/doctor",
  [Roles.ADMIN]: "/admin/users",
  [Roles.STAFF]: "/dashboard/staff",
};

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedAuth = localStorage.getItem("auth");
      if (storedAuth) {
        try {
          const { user, role, token } = JSON.parse(storedAuth);
          setUser(user);
          setRole(role);
          setIsAuthenticated(true);

          if (token) {
            try {
              const response = await userAPI.getCurrentUser();
              if (response?.IsSuccess !== false && response?.Data) {
                const refreshedUser = response.Data;
                setUser(refreshedUser);
                localStorage.setItem(
                  "auth",
                  JSON.stringify({ user: refreshedUser, role, token }),
                );
              }
            } catch {
              // Keep local user data if refresh endpoint fails.
            }
          }
        } catch (error) {
          console.error("Failed to parse stored auth:", error);
          localStorage.removeItem("auth");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function
  const login = (userData, userRole, token = null) => {
    setUser(userData);
    setRole(userRole);
    setIsAuthenticated(true);

    // Persist to localStorage
    localStorage.setItem(
      "auth",
      JSON.stringify({ user: userData, role: userRole, token }),
    );
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout API error:", error);
    }

    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
    localStorage.removeItem("auth");
  };

  // Get dashboard route for current role
  const getDashboardRoute = () => {
    return role ? RoleDashboards[role] : "/auth/login";
  };

  // Check if user has specific role
  const hasRole = (requiredRole) => {
    return role === requiredRole;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (requiredRoles) => {
    return requiredRoles.includes(role);
  };

  const updateProfile = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);

    // Preserve token when updating profile
    const storedAuth = localStorage.getItem("auth");
    let token = null;
    if (storedAuth) {
      try {
        const { token: existingToken } = JSON.parse(storedAuth);
        token = existingToken;
      } catch (error) {
        // Ignore parsing errors
      }
    }

    localStorage.setItem(
      "auth",
      JSON.stringify({ user: newUser, role, token }),
    );
  };

  const value = {
    isAuthenticated,
    user,
    role,
    loading,
    login,
    logout,
    updateProfile,
    getDashboardRoute,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
