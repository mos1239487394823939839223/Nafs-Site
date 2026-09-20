import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Journey } from "./components/Journey";
import { JourneyStepsSection } from "./components/JourneyStepsSection";
import { EmergencyBand } from "./components/EmergencyBand";
import { Services } from "./components/Services";
import { Doctors } from "./components/Doctors";
import { Assessment } from "./components/Assessment";
import { Stats } from "./components/Stats";
import { Testimonials } from "./components/Testimonials";
import { Footer } from "./components/Footer";
import { ChatBubble } from "./components/ChatBubble";
import { SectionDivider } from "./components/SectionDivider";
import { useLanguage } from "../../contexts/LanguageContext";

const LandingPage = () => {
  const { language } = useLanguage();
  const isAr = language === "ar";

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="landing-shell min-h-screen overflow-hidden bg-background">
      <Navbar />
      <Hero />
      <main className="bg-background-paper">
        <Journey />
        <SectionDivider />
        <JourneyStepsSection />
        <SectionDivider />
        <EmergencyBand />
        <SectionDivider />
        <Services />
        <SectionDivider />
        <Doctors />
        <SectionDivider />
        <Assessment />
        <SectionDivider />
        <Stats />
        <SectionDivider />
        <Testimonials />
      </main>
      <Footer />
      <ChatBubble />
    </div>
  );
};

export default LandingPage;
