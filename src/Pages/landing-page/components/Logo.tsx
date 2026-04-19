const Logo = () => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center shrink-0">
      <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 0-4 4c0 1.5.5 2.5 1.5 3.5C8 10.5 7 12 7 14a5 5 0 0 0 10 0c0-2-1-3.5-2.5-4.5C15.5 8.5 16 7.5 16 6a4 4 0 0 0-4-4z"/>
        <path d="M12 14v8"/>
      </svg>
    </div>
    <div className="text-right">
      <div className="font-display font-extrabold text-2xl text-primary leading-none">نَفَس</div>
      <div className="text-[11px] text-muted-foreground mt-1">مساحتك الآمنة للصحة النفسية</div>
    </div>
  </div>
);

export default Logo;
