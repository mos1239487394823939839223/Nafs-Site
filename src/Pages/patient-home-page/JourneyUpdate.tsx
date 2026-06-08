import { MessageCircle, NotebookPen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import doctorAvatar from "./assets/doctor-1.jpg";

export const JourneyUpdate = ({
  update,
  therapistName,
  hasCompletedSession,
}: {
  update: string;
  therapistName: string;
  hasCompletedSession: boolean;
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!hasCompletedSession) return null;

  return (
    <section className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-[0_14px_40px_rgba(15,81,50,0.06)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <img src={doctorAvatar} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover ring-4 ring-[#EAF5EE]" />
          <div className="min-w-0 text-start">
            <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-[#EAF5EE] px-3 py-1 text-xs font-bold text-[#2F855A]">
              <NotebookPen className="h-3.5 w-3.5" />
              {t("patientHome.journeyUpdate.latestBadge")}
            </div>
            <h3 className="text-lg font-black text-[#12372A]">{t("patientHome.journeyUpdate.title")}</h3>
            <p className="mt-1 text-sm leading-6 text-[#60766C]">
              {update || t("patientHome.journeyUpdate.awaiting")}
            </p>
            <p className="mt-2 text-xs font-bold text-[#2F855A]" dir="auto">
              <span dir="auto">{therapistName}</span>
              <span className="mx-1" aria-hidden>
                ·
              </span>
              <span>{t("patientHome.journeyUpdate.justNow")}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/dashboard/patient/messages")}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 self-stretch rounded-2xl bg-[#2F855A] px-5 text-sm font-extrabold text-white transition-colors hover:bg-[#0F5132] sm:self-center"
        >
          <MessageCircle className="h-4 w-4" />
          {t("patientHome.journeyUpdate.messageTherapist")}
        </button>
      </div>
    </section>
  );
};
