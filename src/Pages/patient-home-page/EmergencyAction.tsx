import { useState } from "react";
import { AlertTriangle, Loader2, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useToast } from "../../components/ui/Toast";
import { chatAPI, userAPI } from "../../lib/api";

export const EmergencyAction = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const startEmergencySupport = async () => {
    if (loading) return;
    const patientId = userAPI.resolveUserId(user);
    if (!patientId) {
      toast.error(t("auto.unableToResolvePatientId"));
      return;
    }

    setLoading(true);
    try {
      const response = await chatAPI.openPatientSupportChat(patientId, 3, "emergency", "high");
      if (response?.IsSuccess === false) throw new Error(response?.Message);
      const data = response?.Data ?? response?.data ?? response;
      const roomId = data?.RoomId ?? data?.roomId ?? data?.Id ?? data?.id ?? data?.ChatRoomId ?? data?.chatRoomId;
      const roomParam = roomId ? `&room=${encodeURIComponent(String(roomId))}` : "";
      navigate(`/dashboard/patient/messages?type=support&caseType=emergency&support=1${roomParam}`);
    } catch (error: any) {
      toast.error(error?.message || t("auto.failedToOpenSupportChat"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={startEmergencySupport}
      disabled={loading}
      aria-label={t("patient.startEmergencyChat", "Emergency")}
      className="fixed bottom-5 end-5 sm:bottom-6 sm:end-6 z-[60] inline-flex items-center gap-3 rounded-full border-2 border-red-200 bg-red-600 px-4 py-3 text-white shadow-2xl shadow-red-500/30 transition-colors hover:bg-red-700 disabled:opacity-70"
    >
      <span className="relative w-11 h-11 rounded-full bg-white/15 flex items-center justify-center">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldAlert className="w-6 h-6" />}
      </span>
      <span className="relative flex flex-col items-start leading-tight pe-1">
        <span className="text-sm font-black">{t("patient.startEmergencyChat", "Emergency")}</span>
        <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold">
          <AlertTriangle className="w-3 h-3" />
          {t("auto.highPriority", "High Priority")}
        </span>
      </span>
    </button>
  );
};
