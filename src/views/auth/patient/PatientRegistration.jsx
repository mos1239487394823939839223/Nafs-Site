import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMultiStepForm } from "../../../hooks/useMultiStepForm";
import { useToast } from "../../../components/ui/Toast";
import ProgressStepper from "../../../components/forms/ProgressStepper";
import Button from "../../../components/ui/Button";
import Input, { Select } from "../../../components/ui/Input";
import {
  validateRequired,
  validatePhone,
  validateDate,
  calculateAge,
  validateEmail,
  validatePassword,
} from "../../../lib/validation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  User,
  Heart,
  Shield,
  Lock,
  ShieldCheck as VerifiedUser,
  History,
  HelpCircle as Quiz,
  AlertTriangle as Emergency,
  Headphones as SupportAgent,
  Check,
  X,
} from "lucide-react";

import { authAPI, extractErrorMessage, toUserFacingError } from "../../../lib/api";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Home, Globe } from "lucide-react";

export default function PatientRegistration() {
  const navigate = useNavigate();
  const toast = useToast();
  const { t, language, toggleLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [introStep, setIntroStep] = useState(0);

  const introCards = [
    {
      title: t("auth.intro.privacy.title"),
      subtitle: t("auth.intro.privacy.subtitle"),
      description: t("auth.intro.privacy.description"),
      icon: Lock,
      features: [
        t("auth.intro.privacy.f1"),
        t("auth.intro.privacy.f2"),
        t("auth.intro.privacy.f3"),
        t("auth.intro.privacy.f4"),
      ],
    },
    {
      title: t("auth.intro.security.title"),
      subtitle: t("auth.intro.security.subtitle"),
      description: t("auth.intro.security.description"),
      icon: VerifiedUser,
      features: [
        t("auth.intro.security.f1"),
        t("auth.intro.security.f2"),
        t("auth.intro.security.f3"),
        t("auth.intro.security.f4"),
      ],
    },
    {
      title: t("auth.intro.followup.title"),
      subtitle: t("auth.intro.followup.subtitle"),
      description: t("auth.intro.followup.description"),
      icon: History,
      features: [
        t("auth.intro.followup.f1"),
        t("auth.intro.followup.f2"),
        t("auth.intro.followup.f3"),
        t("auth.intro.followup.f4"),
      ],
    },
    {
      title: t("auth.intro.tests.title"),
      subtitle: t("auth.intro.tests.subtitle"),
      description: t("auth.intro.tests.description"),
      icon: Quiz,
      features: [
        t("auth.intro.tests.f1"),
        t("auth.intro.tests.f2"),
        t("auth.intro.tests.f3"),
        t("auth.intro.tests.f4"),
      ],
    },
    {
      title: t("auth.intro.emergency.title"),
      subtitle: t("auth.intro.emergency.subtitle"),
      description: t("auth.intro.emergency.description"),
      icon: Emergency,
      isSpecial: true,
      features: [
        t("auth.intro.emergency.f1"),
        t("auth.intro.emergency.f2"),
        t("auth.intro.emergency.f3"),
        t("auth.intro.emergency.f4"),
      ],
    },
    {
      title: t("auth.intro.support.title"),
      subtitle: t("auth.intro.support.subtitle"),
      description: t("auth.intro.support.description"),
      icon: SupportAgent,
      features: [
        t("auth.intro.support.f1"),
        t("auth.intro.support.f2"),
        t("auth.intro.support.f3"),
        t("auth.intro.support.f4"),
      ],
    },
  ];

  const steps = [
    {
      id: 1,
      title: t("auth.basicInfo"),
      subtitle: t("auth.personalDetails"),
      icon: User,
    },
    {
      id: 2,
      title: t("auth.verification"),
      subtitle: t("auth.verifyEmail"),
      icon: Shield,
    },
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
  const passwordChecks = validatePassword(formData.password);

  // Step 1 Validation
  const validateStep1 = () => {
    let isValid = true;

    if (!validateRequired(formData.firstName)) {
      setFieldError("firstName", t("errors.firstNameRequired"));
      isValid = false;
    }

    if (!validateRequired(formData.lastName)) {
      setFieldError("lastName", t("errors.lastNameRequired"));
      isValid = false;
    }

    if (!validateEmail(formData.email)) {
      setFieldError("email", t("errors.invalidEmail"));
      isValid = false;
    }

    if (!passwordChecks.isValid) {
      setFieldError("password", t("auth.passwordRequirements"));
      isValid = false;
    }

    if (formData.phone.trim() && !validatePhone(formData.phone)) {
      setFieldError("phone", t("errors.invalidPhone"));
      isValid = false;
    }

    if (!validateDate(formData.dateOfBirth)) {
      setFieldError("dateOfBirth", t("errors.invalidDate"));
      isValid = false;
    }

    if (!validateRequired(formData.gender)) {
      setFieldError("gender", t("errors.selectGender"));
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
        toast.success(response.Data?.Message || t("success.otpSent"));

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

        // If it's a cooldown error, OTP was already sent — treat as soft success
        const isCooldown =
          response.Message &&
          (response.Message.toLowerCase().includes("wait") ||
            response.Message.toLowerCase().includes("seconds") ||
            response.Message.toLowerCase().includes("ثانية"));

        if (isCooldown) {
          setOtpSent(true);
          toast.success(
            t("auth.otpAlreadySent") ||
              "OTP was already sent to your email. Please check your inbox.",
          );
          console.groupEnd();
          return true;
        }

        toast.error(toUserFacingError(response.Message, t("errors.failedSendOtp")));
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
      toast.error(extractErrorMessage(error, t("errors.failedSendOtp")));
      console.groupEnd();
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setFieldError("otp", t("errors.otpRequired"));
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
        Email: formData.email,
        Password: formData.password,
        Gender: genderValue,
        Birthday: new Date(formData.dateOfBirth).toISOString(),
        PhoneNumber: cleanPhone || null,
      };

      console.log("📤 Registration Payload:", payload);

      const registerData = await authAPI.register(payload);
      const registerResponse = { status: 200, data: registerData };

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
          t("errors.somethingWentWrong");
        toast.error(errorMsg);
        console.groupEnd();
        return;
      }

      if (
        registerResponse.data?.IsSuccess !== false &&
        registerResponse.status === 200
      ) {
        console.log(
          "✅ Registration reported successful, proceeding to send OTP...",
        );

        // Registration successful, now send OTP
        const otpSent = await handleSendOTP();
        console.log("OTP send function returned:", otpSent);

        // Always move to OTP step after successful registration.
        // If OTP send failed due to cooldown, the user already has an OTP in their email.
        if (!otpSent) {
          toast.success(
            "OTP was already sent to your email. Please check your inbox.",
          );
        }
        nextStep();
      } else {
        console.error(
          "❌ Registration failed (IsSuccess check):",
          registerResponse.data?.Message || registerResponse.data,
        );
        toast.error(toUserFacingError(registerResponse.data?.Message, t("errors.somethingWentWrong")));
      }
    } catch (error) {
      console.error("❌ Registration Threw Exception:", error);
      console.error("Error Response Data:", error.response?.data);
      console.error("Error Status:", error.response?.status);

      const errorMessage = extractErrorMessage(error, t("errors.somethingWentWrong"));
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
          toast.error(t("errors.fixErrors"));
        }
      } else if (currentStep === 2) {
        isValid = validateStep2();
        if (isValid) {
          await handleSubmit();
        } else {
          toast.error(t("errors.fixErrors"));
        }
      }
    } catch (error) {
      console.error("Unexpected error in handleNext:", error);
      toast.error(t("errors.unexpectedError"));
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Verify OTP to activate account
      const otpResponse = await authAPI.verifyOtp(formData.email, formData.otp);

      if (!otpResponse.IsSuccess) {
        toast.error(toUserFacingError(otpResponse.Message, t("errors.failedVerifyOtp")));
        setLoading(false);
        return;
      }

      setLoading(false);

      // Registration and verification successful
      toast.success(t("success.registrationSuccess"));
      navigate("/auth/login");
    } catch (error) {
      console.error("OTP verification failed:", error);
      setLoading(false);
      toast.error(extractErrorMessage(error, t("errors.failedVerifyOtp")));
    }
  };

  const handleFieldChange = (field, value) => {
    updateFormData({ [field]: value });
    clearFieldError(field);
  };

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8 px-3 sm:px-4">
      {/* ── Floating Top Bar ── */}
      <div className="fixed top-4 inset-x-4 z-50 flex items-center justify-between pointer-events-none">
        <button
          onClick={() => navigate("/")}
          className="pointer-events-auto flex items-center gap-2 bg-background-paper/90 backdrop-blur-md border border-border shadow-lg rounded-full px-4 py-2 text-sm font-semibold text-text-heading hover:text-primary hover:border-primary/40 transition-all duration-200"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">{t("auth.backToHome", "Home")}</span>
        </button>
        <button
          onClick={toggleLanguage}
          className="pointer-events-auto flex items-center gap-2 bg-background-paper/90 backdrop-blur-md border border-border shadow-lg rounded-full px-4 py-2 text-sm font-semibold text-text-heading hover:text-primary hover:border-primary/40 transition-all duration-200"
        >
          <Globe className="w-4 h-4" />
          <span>{language === "ar" ? "English" : "العربية"}</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto pt-12">
        <AnimatePresence mode="wait">
          {showIntro ? (
            <motion.div
              key={`intro-${introStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex justify-center"
            >
              <div
                className={`bg-background-paper rounded-3xl shadow-2xl overflow-hidden flex flex-col border w-full max-w-md ${
                  introCards[introStep].isSpecial
                    ? "border-[#b86b75]/50 shadow-[0_24px_60px_rgba(111,47,57,0.22)] ring-4 ring-[#b86b75]/10"
                    : "border-border"
                }`}
              >
                {/* Header with Gradient */}
                {(() => {
                  const card = introCards[introStep];
                  return (
                    <>
                      <div
                        className={`bg-gradient-to-r p-5 sm:p-8 text-white relative overflow-hidden ${
                          card.isSpecial
                            ? "from-[#8f3f4a] to-[#672b34]"
                            : "from-primary to-primary-dark"
                        }`}
                      >
                        <div className="absolute inset-0 bg-black/10"></div>
                        {card.isSpecial && (
                          <>
                            <div className="absolute -top-16 -end-12 w-40 h-40 rounded-full bg-white/10" />
                            <div className="absolute -bottom-20 -start-14 w-48 h-48 rounded-full bg-[#dca1a8]/10" />
                          </>
                        )}
                        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 relative z-10">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                            <card.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white">
                              {card.title}
                            </h2>
                            <p className="text-white/80 text-xs sm:text-sm">
                              {card.subtitle}
                            </p>
                          </div>
                        </div>
                        <p className="text-white/95 relative z-10 text-sm sm:text-base">
                          {card.description}
                        </p>
                      </div>

                      {/* Features */}
                      <div
                        className={`p-5 sm:p-8 flex-1 ${
                          card.isSpecial
                            ? "bg-gradient-to-b from-[#fffafb] to-background-paper"
                            : "bg-background-paper"
                        }`}
                      >
                        <h3 className="font-semibold text-text-heading mb-4">
                          {t("auth.whatYouGet")}
                        </h3>
                        <ul className="space-y-3">
                          {card.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-3 text-text-muted"
                            >
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  card.isSpecial
                                    ? "bg-[#8f3f4a]/10"
                                    : "bg-primary/10"
                                }`}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    card.isSpecial
                                      ? "bg-[#8f3f4a]"
                                      : "bg-primary"
                                  }`}
                                />
                              </div>
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Navigation buttons for intro */}
                      <div className="p-5 sm:p-8 pt-0 flex gap-3">
                        <Button
                          onClick={() => {
                            if (introStep < introCards.length - 1) {
                              setIntroStep(introStep + 1);
                            } else {
                              setShowIntro(false);
                            }
                          }}
                          className="flex-1 group"
                          sx={
                            card.isSpecial
                              ? {
                                  backgroundColor: "#8f3f4a",
                                  "&:hover": { backgroundColor: "#672b34" },
                                }
                              : undefined
                          }
                        >
                          {introStep === introCards.length - 1 ? (
                            <>
                              <ArrowRight className="w-4 h-4 me-2 rtl:rotate-180" />
                              <span>{t("auth.getStarted")}</span>
                            </>
                          ) : (
                            <>
                              <ArrowLeft className="w-4 h-4 me-2 rtl:rotate-180" />
                              <span>{t("common.next")}</span>
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (introStep === 0) {
                              navigate("/auth/role-selection");
                            } else {
                              setIntroStep(introStep - 1);
                            }
                          }}
                          className="flex-1"
                        >
                          <span>{t("common.back")}</span>
                          <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl mx-auto"
            >
              <div className="bg-background-paper/80 backdrop-blur-sm rounded-3xl shadow-2xl p-5 sm:p-8 md:p-10 border border-white/20">
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
                            {t("auth.basicInformation")}
                          </h2>
                          <p className="text-sm text-text-muted">
                            {t("auth.tellUsAboutYourself")}
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <Input
                          label={t("auth.firstName")}
                          value={formData.firstName}
                          onChange={(e) =>
                            handleFieldChange("firstName", e.target.value)
                          }
                          error={errors.firstName}
                          placeholder={t("auth.placeholders.firstName")}
                        />
                        <Input
                          label={t("auth.lastName")}
                          value={formData.lastName}
                          onChange={(e) =>
                            handleFieldChange("lastName", e.target.value)
                          }
                          error={errors.lastName}
                          placeholder={t("auth.placeholders.lastName")}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <Input
                          label={t("auth.email")}
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleFieldChange("email", e.target.value)
                          }
                          error={errors.email}
                          placeholder={t("auth.placeholders.email")}
                        />
                        <Input
                          label={t("auth.password")}
                          type="password"
                          value={formData.password}
                          onChange={(e) =>
                            handleFieldChange("password", e.target.value)
                          }
                          error={errors.password}
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="rounded-2xl border border-border bg-background-subtle/60 p-4">
                        <p className="mb-3 text-sm font-bold text-text-heading">
                          {t("auth.passwordRequirements", "Password must contain:")}
                        </p>
                        <div className="grid gap-2 text-xs sm:grid-cols-2">
                          {[
                            [passwordChecks.minLength, t("auth.passwordMinLength", "At least 8 characters")],
                            [passwordChecks.hasUpperCase, t("auth.passwordUppercase", "One uppercase letter (A-Z)")],
                            [passwordChecks.hasLowerCase, t("auth.passwordLowercase", "One lowercase letter (a-z)")],
                            [passwordChecks.hasNumber, t("auth.passwordNumber", "At least one number")],
                            [passwordChecks.hasSpecialChar, t("auth.passwordSpecial", "One special character")],
                          ].map(([passed, label]) => (
                            <div key={String(label)} className={`flex items-center gap-2 ${passed ? "text-green-700" : "text-text-muted"}`}>
                              <span className={`grid h-5 w-5 place-items-center rounded-full ${passed ? "bg-green-100" : "bg-background-paper"}`}>
                                {passed ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                              </span>
                              <span>{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Input
                        label={`${t("auth.phoneNumber")} (${t("common.optional", "Optional")})`}
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          handleFieldChange("phone", e.target.value)
                        }
                        error={errors.phone}
                        placeholder={t("auth.placeholders.phone")}
                      />

                      <div className="grid md:grid-cols-2 gap-6">
                        <Input
                          label={t("auth.dateOfBirth")}
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) =>
                            handleFieldChange("dateOfBirth", e.target.value)
                          }
                          error={errors.dateOfBirth}
                          max={new Date().toISOString().split("T")[0]}
                          slotProps={{ inputLabel: { shrink: true } }}
                        />
                        <Select
                          label={t("common.gender")}
                          value={formData.gender}
                          onChange={(e) =>
                            handleFieldChange("gender", e.target.value)
                          }
                          error={errors.gender}
                        >
                          <option value="">{t("common.selectGender")}</option>
                          <option value="male">{t("common.male")}</option>
                          <option value="female">{t("common.female")}</option>
                          <option value="other">{t("common.other")}</option>
                        </Select>
                      </div>

                      {formData.dateOfBirth &&
                        validateDate(formData.dateOfBirth) && (
                          <div className="bg-primary/10 p-4 rounded-lg">
                            <p className="text-sm text-primary">
                              {t("common.age")}:{" "}
                              {calculateAge(formData.dateOfBirth)}{" "}
                              {t("common.yearsOld")}
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
                            {t("auth.emailVerification")}
                          </h2>
                          <p className="text-sm text-clinical-gray">
                            {t("auth.verifyYourEmail")}
                          </p>
                        </div>
                      </div>

                      <div className="bg-primary/10 p-6 rounded-lg text-center">
                        <p className="text-text-heading mb-2">
                          {t("auth.verificationSentTo")}
                        </p>
                        <p className="text-xl font-semibold text-primary">
                          {formData.email}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-text-heading mb-2">
                            {t("auth.enter6Digit")}
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
                            placeholder={t("auth.placeholders.otp")}
                          />
                          {errors.otp && (
                            <p className="mt-1 text-sm text-red-500">
                              {errors.otp}
                            </p>
                          )}
                        </div>

                        <div className="text-center">
                          {otpTimer > 0 ? (
                            <p className="text-sm text-clinical-gray">
                              {t("auth.resendIn")}{" "}
                              <span className="font-semibold text-medical-blue">
                                {otpTimer}s
                              </span>
                            </p>
                          ) : (
                            <button
                              onClick={handleSendOTP}
                              className="text-sm text-primary hover:underline"
                            >
                              {t("auth.resendOtp")}
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
                    onClick={() => {
                      if (isFirstStep) {
                        setShowIntro(true);
                      } else {
                        previousStep();
                      }
                    }}
                    disabled={loading}
                  >
                    <ArrowLeft className="w-4 h-4 me-2 rtl:rotate-180" />
                    {t("common.back")}
                  </Button>

                  <Button onClick={handleNext} disabled={loading}>
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{t("common.processing")}</span>
                      </div>
                    ) : isLastStep ? (
                      <>
                        <CheckCircle className="w-4 h-4 me-2 rtl:rotate-180" />
                        {t("auth.completeRegistration")}
                      </>
                    ) : (
                      <>
                        {t("common.next")}
                        <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
