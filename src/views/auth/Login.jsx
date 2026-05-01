import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useToast } from "../../components/ui/Toast";
import { useAuth, Roles, RoleDashboards } from "../../contexts/AuthContext";
import {
  validateEmail,
  validatePassword,
  getPasswordStrength,
} from "../../lib/validation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { authAPI } from "../../lib/api";
import { useLanguage } from "../../contexts/LanguageContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { login: authLogin } = useAuth();
  const { t } = useLanguage();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = t("errors.invalidEmail");
    }

    if (!formData.password) {
      newErrors.password = t("errors.passwordRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Login attempt with:", formData.email);

    if (!validateForm()) {
      console.log("Validation failed", errors);
      toast.error(t("errors.fixFormErrors"));
      return;
    }

    console.log("Validation passed, calling API...");
    setLoading(true);

    try {
      // Call login API
      const response = await authAPI.login(formData.email, formData.password);
      console.log("API Response raw:", response);

      if (response.IsSuccess) {
        // Extract user data from response
        const userData = response.Data || {};

        // Determine role from user data
        let userRole = userData.Role;

        // Handle numeric roles from API
        if (typeof userRole === "number") {
          const roleIdMapping = {
            1: Roles.ADMIN,
            2: Roles.DOCTOR,
            3: Roles.PATIENT,
            4: Roles.STAFF,
          };
          userRole = roleIdMapping[userRole] || Roles.PATIENT;
        }
        // Handle string roles
        else if (typeof userRole === "string") {
          const roleMapping = {
            patient: Roles.PATIENT,
            doctor: Roles.DOCTOR,
            admin: Roles.ADMIN,
            staff: Roles.STAFF,
          };
          userRole = roleMapping[userRole.toLowerCase()] || Roles.PATIENT;
        } else {
          // Default fallback
          userRole = Roles.PATIENT;
        }

        // Extract token from response — try all possible field names
        // Swagger says the field is "Authorization" in UserLoginResponse
        let token =
          userData.Authorization ||
          userData.Token ||
          userData.token ||
          userData.AccessToken ||
          null;

        // Debug: log what we got so we can verify
        console.log(
          "Token extraction — Available keys:",
          Object.keys(userData),
        );
        console.log(
          "Token extraction — userData.Authorization:",
          userData.Authorization
            ? "EXISTS (length: " + userData.Authorization.length + ")"
            : "MISSING",
        );
        console.log(
          "Token extraction — Final token:",
          token ? "EXISTS (length: " + token.length + ")" : "NULL",
        );

        // Clean token — strip "Bearer " prefix if the API already includes it
        if (
          token &&
          typeof token === "string" &&
          token.toLowerCase().startsWith("bearer ")
        ) {
          token = token.substring(7).trim();
        }

        // Update Auth Context
        authLogin(userData, userRole, token);

        toast.success(response.Message || t("success.loginSuccess"));

        // Determine redirect path from route state first, then fallback to role dashboard.
        const fromPath = location.state?.from?.pathname;
        const targetPath = fromPath || RoleDashboards[userRole];

        setLoading(false);

        if (targetPath) {
          navigate(targetPath, { replace: true });
        } else {
          console.error("Unknown role or missing dashboard path:", userRole);
          // Default to home or patient dashboard if path is missing
          navigate("/dashboard/patient", { replace: true });
        }
      } else {
        console.log("Login failed (IsSuccess false):", response.Message);
        toast.error(response.Message || t("errors.loginFailed"));
        setLoading(false);
      }
    } catch (error) {
      console.error("Login caught error:", error);
      let errorMessage = t("errors.loginFailed");

      if (error.code === "ECONNABORTED") {
        errorMessage = t("errors.connectionTimeout");
      } else if (!error.response) {
        errorMessage = t("errors.networkError");
      } else if (error.response?.data?.Message) {
        errorMessage = error.response.data.Message;
      }

      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background-paper to-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">
            {t("auth.platformName")}
          </h1>
          <p className="text-text-light mt-2">{t("auth.platformTagline")}</p>
        </div>

        {/* Card */}
        <div className="bg-background-paper rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-text">
              {t("auth.signInTitle")}
            </h2>
            <p className="text-text-muted mt-2">{t("auth.signInSubtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <Input
                type="email"
                name="email"
                label={t("auth.email")}
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                {t("auth.password")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 pe-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-text placeholder-text-muted ${
                    errors.password ? "border-red-500" : "border-border"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t("common.pleaseWait")}</span>
                </div>
              ) : (
                t("auth.login")
              )}
            </Button>
          </form>

          {/* Forgot Password */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate("/auth/forgot-password")}
              className="text-sm text-primary hover:underline"
            >
              {t("auth.forgotPassword")}
            </button>
          </div>

          {/* Toggle Login/Register */}
          <div className="mt-4 text-center">
            <p className="text-sm text-text-muted">
              {t("auth.noAccount")}{" "}
              <button
                type="button"
                onClick={() => navigate("/auth/role-selection")}
                className="text-primary font-medium hover:underline"
              >
                {t("auth.register")}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
