import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Journey } from "./components/Journey";
import { EmergencyBand } from "./components/EmergencyBand";
import { Services } from "./components/Services";
import { Doctors } from "./components/Doctors";
import { Assessment } from "./components/Assessment";
import { Stats } from "./components/Stats";
import { Testimonials } from "./components/Testimonials";
import { FinalCTA } from "./components/FinalCTA";
import { Footer } from "./components/Footer";
import { ChatBubble } from "./components/ChatBubble";
import { useLanguage } from "../../contexts/LanguageContext";

const LandingPage = () => {
  const { language } = useLanguage();
  const isAr = language === "ar";

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <main>
        <Journey />
        <EmergencyBand />
        <Services />
        <Doctors />
        <Assessment />
        <Stats />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
      <ChatBubble />
    </div>
  );
};

export default LandingPage;
