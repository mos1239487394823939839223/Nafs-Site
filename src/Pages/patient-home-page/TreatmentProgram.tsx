import { Leaf } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export const TreatmentProgram = () => {
  const { t, isRTL } = useLanguage();
  const current = 4;
  const total   = 8;
  const percent = Math.round((current / total) * 100);

  return (
    <section className="bg-card rounded-2xl p-6 shadow-card relative overflow-hidden" dir="ltr">
      <Leaf
        className="absolute bottom-2 w-32 h-32 text-primary opacity-10 -rotate-12 pointer-events-none -left-2"
      />

      <div className="relative">
        <p className="text-xs text-muted-foreground text-center mb-1">
          {t("patientHome.treatmentProgram.label")}
        </p>
        <h3 className="text-xl font-bold text-center mb-4">
          {t("patientHome.treatmentProgram.title")}
        </h3>

        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-semibold">{percent}%</span>
          <span className="text-muted-foreground">
            {t("patientHome.treatmentProgram.session")} {current} {t("patientHome.treatmentProgram.of")} {total}
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-6">
          <div className="h-full bg-primary rounded-full" style={{ width: `${percent}%` }} />
        </div>

        <button className="w-full border border-border hover:bg-primary-soft hover:border-primary hover:text-primary font-semibold py-2.5 rounded-xl text-sm transition-colors">
          {t("patientHome.treatmentProgram.continue")}
        </button>
      </div>
    </section>
  );
};
