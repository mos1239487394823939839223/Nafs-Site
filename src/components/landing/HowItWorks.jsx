import { useLanguage } from "../../contexts/LanguageContext";
import { motion } from "framer-motion";
import { ClipboardList, UserRoundSearch, CalendarCheck2 } from "lucide-react";

const HowItWorks = () => {
  const { t, isRTL } = useLanguage();

  const steps = [
    { n: "1", key: "step1", icon: <ClipboardList className="w-14 h-14" /> },
    { n: "2", key: "step2", icon: <UserRoundSearch className="w-14 h-14" /> },
    { n: "3", key: "step3", icon: <CalendarCheck2 className="w-14 h-14" /> },
  ];

  return (
    <section className="px-6 lg:px-10 py-24 bg-[#fdfdfd] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-bold text-3xl md:text-4xl text-[#1a4d35] tracking-tight"
          >
            {t("landing.howItWorks.title")}
          </motion.h2>
        </div>

        {/* Steps Container */}
        <div className="relative">
          {/* Horizontal Connecting Dashed Lines (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-px -translate-y-1/2 z-0">
            <div className="w-full h-full border-t-2 border-dashed border-[#1a4d35]/20" />
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 relative z-10 ${isRTL ? "md:flex-row-reverse" : ""}`}>
            {steps.map((s, idx) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative"
              >
                {/* Connector Dot between cards (Desktop) */}
                {idx < 2 && (
                  <div className={`hidden md:block absolute top-1/2 ${isRTL ? '-left-8' : '-right-8'} w-3 h-3 rounded-full bg-[#1a4d35] z-20 -translate-y-1/2 shadow-sm`} />
                )}

                <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.08)] transition-all duration-500 relative min-h-[300px] flex flex-col items-center justify-center">
                  {/* Number Badge at Top Right */}
                  <div className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#1a4d35] text-white flex items-center justify-center font-bold text-base shadow-sm z-30">
                    {s.n}
                  </div>

                  {/* Icon Container */}
                  <div className="mb-8 text-[#1a4d35]/70">
                    {s.icon}
                  </div>
                  
                  <h3 className="font-bold text-2xl mb-4 text-[#1a4d35]">
                    {t(`landing.howItWorks.${s.key}.title`)}
                  </h3>
                  
                  <p className="text-gray-500 text-base leading-relaxed max-w-[280px]">
                    {t(`landing.howItWorks.${s.key}.desc`)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
