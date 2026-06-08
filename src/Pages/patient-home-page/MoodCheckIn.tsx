import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

type MoodKey = "terrible" | "bad" | "okay" | "good" | "great";

const moodMeta: Array<{
  key: MoodKey;
  labelKey: string;
  emoji: string;
  color: string;
  ring: string;
}> = [
  { key: "terrible", labelKey: "patientHome.moodCheckIn.terrible", emoji: "😣", color: "bg-[#EF4444]", ring: "ring-[#FCA5A5]" },
  { key: "bad", labelKey: "patientHome.moodCheckIn.bad", emoji: "🙁", color: "bg-[#F97316]", ring: "ring-[#FDBA74]" },
  { key: "okay", labelKey: "patientHome.moodCheckIn.okay", emoji: "😐", color: "bg-[#FACC15]", ring: "ring-[#FDE68A]" },
  { key: "good", labelKey: "patientHome.moodCheckIn.good", emoji: "🙂", color: "bg-[#FBBF24]", ring: "ring-[#FDE68A]" },
  { key: "great", labelKey: "patientHome.moodCheckIn.great", emoji: "😊", color: "bg-[#79C267]", ring: "ring-[#BBF7D0]" },
];

export const MoodCheckIn = () => {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<MoodKey | null>(null);

  return (
    <section className="rounded-[26px] border border-[#E5E7EB] bg-white p-5 text-center shadow-sm md:p-6">
      <h3 className="text-xl font-black text-[#12372A]">
        {t("patientHome.moodCheckIn.title", "كيف تشعر اليوم؟")}
      </h3>
      <p className="mt-2 text-sm font-medium text-[#6B7F75]">
        {t("patientHome.moodCheckIn.subtitle", "شاركنا مشاعرك لمساعدتك بشكل أفضل")}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {moodMeta.map((mood) => {
          const isSelected = selected === mood.key;

          return (
            <button
              key={mood.key}
              type="button"
              onClick={() => setSelected(mood.key)}
              className={`group min-h-[92px] rounded-2xl border bg-white px-3 py-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#B8D5C9] hover:shadow-lg ${
                isSelected
                  ? `border-[#2F855A] ring-4 ${mood.ring}`
                  : "border-[#E5E7EB]"
              }`}
              aria-pressed={isSelected}
            >
              <span
                className={`mx-auto grid h-11 w-11 place-items-center rounded-full ${mood.color} text-xl shadow-sm transition-transform duration-200 group-hover:scale-110`}
              >
                {mood.emoji}
              </span>
              <span className="mt-3 block text-sm font-bold text-[#12372A]">
                {t(mood.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
