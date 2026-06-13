import { Logo } from "./Logo";
import { Mail, MapPin, Phone } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";

const socialIcons = [
  {
    label: "Instagram",
    path: (
      <>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </>
    ),
  },
  {
    label: "Twitter",
    path: <path d="M4 4l11.7 16h4.1L8.1 4H4zm15.8 0L4 20h3.2L23 4h-3.2z" />,
  },
  {
    label: "Facebook",
    path: <path d="M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v4h4v-4h3l1-4h-4V9c0-.6.4-1 1-1z" />,
  },
  {
    label: "LinkedIn",
    path: (
      <>
        <path d="M6.5 10H3v10h3.5V10zM4.75 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
        <path d="M10 10h3.4v1.4h.1c.5-.9 1.7-1.8 3.4-1.8 3.6 0 4.1 2.3 4.1 5.3V20h-3.5v-4.6c0-1.1 0-2.5-1.6-2.5s-1.9 1.2-1.9 2.4V20H10V10z" />
      </>
    ),
  },
];

export const Footer = () => {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const quickLinks = isAr ? ["الرئيسية", "الخدمات", "الدكاترة", "المقالات"] : ["Home", "Services", "Doctors", "Articles"];
  const supportLinks = isAr
    ? ["الأسئلة الشائعة", "سياسة الخصوصية", "الشروط والأحكام"]
    : ["FAQ", "Privacy policy", "Terms and conditions"];

  return (
    <footer dir={isAr ? "rtl" : "ltr"} className="border-t border-border bg-background-paper">
      <div className="container mx-auto grid gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
        <div className="text-start">
          <Logo />
          <p className="mt-4 max-w-xs text-sm font-semibold leading-7 text-text-light">
            {isAr
              ? "نفس منصة دعم نفسي تساعدك على فهم نفسك والتحدث مع متخصصين في بيئة آمنة."
              : "Nafas is a mental support platform for understanding yourself and speaking with specialists in a safe space."}
          </p>
          <div className="mt-5 flex gap-3">
            {socialIcons.map((icon) => (
              <a
                key={icon.label}
                href="#"
                className="grid h-9 w-9 place-items-center rounded-full border border-border text-text-light hover:bg-background hover:text-primary"
                aria-label={icon.label}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={icon.label === "Instagram" ? "none" : "currentColor"}
                  stroke={icon.label === "Instagram" ? "currentColor" : "none"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  {icon.path}
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className="text-start">
          <h4 className="mb-4 text-base font-black text-text-heading">{isAr ? "روابط سريعة" : "Quick links"}</h4>
          <ul className="space-y-3 text-sm font-semibold text-text-light">
            {quickLinks.map((link) => (
              <li key={link}>
                <a href="#" className="hover:text-primary">{link}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-start">
          <h4 className="mb-4 text-base font-black text-text-heading">{isAr ? "الدعم والمساعدة" : "Support"}</h4>
          <ul className="space-y-3 text-sm font-semibold text-text-light">
            {supportLinks.map((link) => (
              <li key={link}>
                <a href="#" className="hover:text-primary">{link}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-start">
          <h4 className="mb-4 text-base font-black text-text-heading">{isAr ? "تواصل معنا" : "Contact us"}</h4>
          <ul className="space-y-3 text-sm font-semibold text-text-light">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-text-light" />010 1234 5678</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-text-light" />info@nafas.com</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-text-light" />{isAr ? "القاهرة، مصر" : "Cairo, Egypt"}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="container mx-auto px-4 py-5 text-center text-xs font-semibold text-text-light">
          {isAr ? "جميع الحقوق محفوظة © 2026 نفس" : "All rights reserved © 2026 Nafas"}
        </p>
      </div>
    </footer>
  );
};
