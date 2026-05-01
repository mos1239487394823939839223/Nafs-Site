import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../components/ui/Toast";
import ProfileSettings from "../../components/patient/settings/ProfileSettings";
import { userAPI, filesAPI, extractErrorMessage } from "../../lib/api";
import { Eye, EyeOff, Lock } from "lucide-react";
import Button from "../../components/ui/Button";
import { useLanguage } from "../../contexts/LanguageContext";

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const { t, isRTL } = useLanguage();

  // Change password state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleSave = async (data) => {
    try {
      const response = await userAPI.editMainInfo({
        name: data.name,
        phoneNumber: data.phone,
        email: data.email,
      });

      if (response?.IsSuccess === true) {
        updateProfile(data);
        toast.success(t("success.settingsSaved"));
      } else {
        toast.error(response?.Message || t("errors.saveFailed"));
      }
    } catch (error) {
      console.error("Save settings error:", error);
      toast.error(extractErrorMessage(error, t("errors.saveFailed")));
    }
  };

  const handleImageUpload = async (file) => {
    try {
      // 1. Upload file to get a URL
      const uploadResponse = await filesAPI.uploadFile(file);
      const imageUrl = uploadResponse?.Data?.PublicUrl || uploadResponse?.Data;
      if (!imageUrl) {
        toast.error(t("errors.photoUpdateFailed"));
        return;
      }
      // 2. Send URL to UpdateImage
      const response = await userAPI.updateCurrentUserImage(user, imageUrl);
      if (response?.IsSuccess === true) {
        updateProfile({ image: imageUrl });
        toast.success(t("success.photoUpdated"));
      } else {
        toast.error(response?.Message || t("errors.photoUpdateFailed"));
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(extractErrorMessage(error, t("errors.photoUpdateFailed")));
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error(t("errors.fillAllPasswordFields"));
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error(t("errors.passwordMinLength"));
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t("errors.passwordsDoNotMatch"));
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await userAPI.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
      );
      if (response?.IsSuccess === true) {
        toast.success(t("success.passwordChanged"));
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordSection(false);
      } else {
        toast.error(response?.Message || t("errors.passwordChangeFailed"));
      }
    } catch (error) {
      toast.error(extractErrorMessage(error, t("errors.passwordChangeFailed")));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-background p-6 md:p-10"
      
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">
            {t("settings.profile")}
          </h1>
          <p className="text-text-muted">{t("settings.managePersonalInfo")}</p>
        </div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background-paper rounded-2xl shadow-lg border border-border overflow-hidden"
        >
          {/* Decorative Top Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-primary/50" />

          <div className="p-6 md:p-8">
            <ProfileSettings
              user={user}
              onSave={handleSave}
              onImageUpload={handleImageUpload}
            />
          </div>
        </motion.div>

        {/* Change Password Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 bg-background-paper rounded-2xl shadow-lg border border-border overflow-hidden"
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-text">
                    {t("settings.changePassword")}
                  </h3>
                  <p className="text-sm text-text-muted">
                    {t("settings.updateAccountPassword")}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
              >
                {showPasswordSection
                  ? t("common.cancel", "Cancel")
                  : t("common.change", "Change")}
              </Button>
            </div>

            {showPasswordSection && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4 pt-4 border-t border-border"
              >
                {[
                  { key: "currentPassword", visKey: "current" },
                  { key: "newPassword", visKey: "new" },
                  { key: "confirmPassword", visKey: "confirm" },
                ].map(({ key, visKey }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      {key === "currentPassword"
                        ? t("settings.currentPassword")
                        : key === "newPassword"
                        ? t("settings.newPassword")
                        : t("settings.confirmNewPassword")}
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords[visKey] ? "text" : "password"}
                        value={passwordData[key]}
                        style={
                          showPasswords[visKey]
                            ? { WebkitTextSecurity: "none" }
                            : undefined
                        }
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        className={`w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text ${
                          "pe-10"
                        }`}
                        placeholder={
                          key === "currentPassword"
                            ? t("settings.currentPassword", "Current password")
                            : key === "newPassword"
                            ? t("settings.newPassword", "New password")
                            : t(
                                "settings.confirmNewPassword",
                                "Confirm new password",
                              )
                        }
                      />
                      <button
                        type="button"
                        aria-label={
                          showPasswords[visKey]
                            ? t("auto.hidePassword")
                            : t("auto.showPassword")
                        }
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            [visKey]: !prev[visKey],
                          }))
                        }
                        className={`absolute inset-y-0 ${
                          "end-3"
                        } z-10 flex items-center text-text-muted hover:text-text-heading`}
                      >
                        {showPasswords[visKey] ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleChangePassword}
                    disabled={passwordLoading}
                  >
                    {passwordLoading
                      ? t("common.updating", "Updating...")
                      : t("settings.updatePassword", "Update Password")}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
