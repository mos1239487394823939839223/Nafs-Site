import Logo from "./Logo";

const Footer = () => (
  <footer className="px-6 lg:px-10 py-10 border-t border-border/60">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <Logo />
      <div className="flex gap-6 text-sm text-text-light">
        <a href="#" className="hover:text-primary transition-colors">الخصوصية</a>
        <a href="#" className="hover:text-primary transition-colors">الشروط</a>
        <a href="#" className="hover:text-primary transition-colors">تواصل معنا</a>
      </div>
      <p className="text-xs text-text-light">© 2026 نَفَس — جميع الحقوق محفوظة</p>
    </div>
  </footer>
);

export default Footer;
