import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMultiStepForm } from "../../../hooks/useMultiStepForm";
import { useAuth, Roles } from "../../../contexts/AuthContext";
import { useClinic } from "../../../contexts/ClinicContext";
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

export default function PatientRegistration() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { registerUser } = useClinic();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const steps = [
    { id: 1, title: "Basic Info", subtitle: "Personal details", icon: User },
    { id: 2, title: "Verification", subtitle: "Verify email", icon: Shield },
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
      setFieldError("firstName", "First name is required");
      isValid = false;
    }

    if (!validateRequired(formData.lastName)) {
      setFieldError("lastName", "Last name is required");
      isValid = false;
    }

    if (!validateEmail(formData.email)) {
      setFieldError("email", "Please enter a valid email address");
      isValid = false;
    }

    if (!validateRequired(formData.password) || formData.password.length < 6) {
      setFieldError("password", "Password must be at least 6 characters");
      isValid = false;
    }

    if (!validatePhone(formData.phone)) {
      setFieldError("phone", "Please enter a valid Egyptian phone number");
      isValid = false;
    }

    if (!validateDate(formData.dateOfBirth)) {
      setFieldError("dateOfBirth", "Please enter a valid date of birth");
      isValid = false;
    } else {
      const age = calculateAge(formData.dateOfBirth);
      if (age < 13) {
        setFieldError("dateOfBirth", "You must be at least 13 years old");
        isValid = false;
      }
    }

    if (!validateRequired(formData.gender)) {
      setFieldError("gender", "Please select your gender");
      isValid = false;
    }

    console.log("Step 1 validation result:", isValid, "Form data:", formData);
    return isValid;
  };

  // Step 3 - Send OTP
  const handleSendOTP = async () => {
    setLoading(true);

    try {
      // Call API to send OTP (user must already be registered)
      const response = await authAPI.sendOtp(formData.email);

      if (response.IsSuccess) {
        setOtpSent(true);
        setOtpTimer(60);
        toast.success(
          response.Data?.Message || `OTP sent to ${formData.email}`,
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

        return true;
      } else {
        toast.error(response.Message || "Failed to send OTP");
        return false;
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      toast.error(
        error.response?.data?.Message ||
          "Failed to send OTP. Please try again.",
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setFieldError("otp", "Please enter the 6-digit OTP");
      return false;
    }
    return true;
  };

  // Register user first (Step 1 completion)
  const handleRegisterUser = async () => {
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

      console.log("Registration payload:", payload);

      const registerResponse = await api.post("/Auth/Register", payload);
      console.log("Registration response:", registerResponse);
      console.log("Registration response data:", registerResponse.data);
      console.log("IsSuccess value:", registerResponse.data?.IsSuccess);
      console.log("Message:", registerResponse.data?.Message);
      console.log("Details:", registerResponse.data?.Details);
      console.log("Status:", registerResponse.status);

      // Check if response has an error message (backend error)
      if (
        registerResponse.data?.Message &&
        (registerResponse.data.Message.includes("error") ||
          registerResponse.data.Message.includes("Error"))
      ) {
        console.error(
          "Registration failed with backend error:",
          registerResponse.data,
        );
        console.error("Error message:", registerResponse.data.Message);
        console.error("Error details:", registerResponse.data.Details);
        const errorMsg =
          registerResponse.data.Details ||
          registerResponse.data.Message ||
          "Registration failed";
        toast.error(errorMsg);
        return;
      }

      if (
        registerResponse.data?.IsSuccess !== false &&
        registerResponse.status === 200
      ) {
        console.log("Registration successful, sending OTP...");
        // Registration successful, now send OTP
        const otpSent = await handleSendOTP();
        console.log("OTP sent result:", otpSent);
        // Only move to next step if OTP was sent successfully
        if (otpSent) {
          nextStep();
        }
      } else {
        console.error(
          "Registration failed:",
          registerResponse.data?.Message || registerResponse.data,
        );
        toast.error(registerResponse.data?.Message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error response:", error.response);
      const errorMessage =
        error.response?.data?.Message ||
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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
          toast.error("Please fix the errors before continuing");
        }
      } else if (currentStep === 2) {
        isValid = validateStep2();
        if (isValid) {
          await handleSubmit();
        } else {
          toast.error("Please fix the errors before continuing");
        }
      }
    } catch (error) {
      console.error("Unexpected error in handleNext:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Verify OTP to activate account
      const otpResponse = await authAPI.verifyOtp(formData.email, formData.otp);

      if (!otpResponse.IsSuccess) {
        toast.error(otpResponse.Message || "Invalid OTP");
        setLoading(false);
        return;
      }

      setLoading(false);

      // Registration and verification successful
      toast.success("Registration successful! Please sign in.");
      navigate("/auth/login");
    } catch (error) {
      console.error("OTP verification failed:", error);
      setLoading(false);
      const errorMessage =
        error.response?.data?.Message ||
        error.response?.data?.message ||
        error.message ||
        "Verification failed. Please try again.";
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
                      Basic Information
                    </h2>
                    <p className="text-sm text-text-muted">
                      Tell us about yourself
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleFieldChange("firstName", e.target.value)
                    }
                    error={errors.firstName}
                    placeholder="Ahmed"
                  />
                  <Input
                    label="Last Name"
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
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    error={errors.email}
                    placeholder="you@example.com"
                  />
                  <Input
                    label="Password"
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
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  error={errors.phone}
                  placeholder="+20 XXX XXX XXXX"
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Date of Birth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      handleFieldChange("dateOfBirth", e.target.value)
                    }
                    error={errors.dateOfBirth}
                    max={new Date().toISOString().split("T")[0]}
                  />
                  <Select
                    label="Gender"
                    value={formData.gender}
                    onChange={(e) =>
                      handleFieldChange("gender", e.target.value)
                    }
                    error={errors.gender}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Select>
                </div>

                {formData.dateOfBirth && validateDate(formData.dateOfBirth) && (
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <p className="text-sm text-primary">
                      Age: {calculateAge(formData.dateOfBirth)} years old
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
                      Email Verification
                    </h2>
                    <p className="text-sm text-clinical-gray">
                      Verify your email address
                    </p>
                  </div>
                </div>

                <div className="bg-primary/10 p-6 rounded-lg text-center">
                  <p className="text-text-heading mb-2">
                    A verification code has been sent to:
                  </p>
                  <p className="text-xl font-semibold text-primary">
                    {formData.email}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-heading mb-2">
                      Enter 6-Digit Code
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
                      className={`w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text ${
                        errors.otp ? "border-red-500" : "border-border"
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
                        Resend code in{" "}
                        <span className="font-semibold text-medical-blue">
                          {otpTimer}s
                        </span>
                      </p>
                    ) : (
                      <button
                        onClick={handleSendOTP}
                        className="text-sm text-primary hover:underline"
                      >
                        Resend verification code
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
              Back
            </Button>

            <Button onClick={handleNext} disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : isLastStep ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Registration
                </>
              ) : (
                <>
                  Next
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
