import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import en from '../../i18n/en'
import ar from '../../i18n/ar'
const translations = { en, ar }
import Logo from '../../components/landing/Logo'
import heroImg from '../../Pages/landing-home-final/assets/hero-armchair.jpg'
import doctor1 from '../../Pages/landing-home-final/assets/doctor-1.jpg'
import doctor2 from '../../Pages/landing-home-final/assets/doctor-2.jpg'
import doctor3 from '../../Pages/landing-home-final/assets/doctor-3.jpg'
import doctor4 from '../../Pages/landing-home-final/assets/doctor-4.jpg'
import assessImg from '../../Pages/landing-home-final/assets/assessment-illustration.jpg'
import testimonial1 from '../../Pages/landing-home-final/assets/testimonial-1.jpg'
import testimonial2 from '../../Pages/landing-home-final/assets/testimonial-2.jpg'
import testimonial3 from '../../Pages/landing-home-final/assets/testimonial-3.jpg'

// ─── Navbar ──────────────────────────────────────────────────────────────────
function LandingNavbar() {
  const { t, isRTL, language, setLanguage } = useLanguage()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: t('landing.nav.home'), href: '#' },
    { label: t('landing.nav.services'), href: '#services' },
    { label: t('landing.nav.doctors'), href: '#doctors' },
    { label: t('landing.nav.about'), href: '#about' },
  ]

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background-paper/95 backdrop-blur-md shadow-card' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <a key={l.label} href={l.href} className="text-sm text-text-muted hover:text-primary transition-colors font-medium">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted border border-border hover:border-primary hover:text-primary transition-colors"
          >
            {language === 'ar' ? 'EN' : 'عر'}
          </button>
          <button
            onClick={() => navigate('/auth/login')}
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-primary border border-primary hover:bg-primary/10 transition-colors"
          >
            {t('landing.nav.login')}
          </button>
          <button
            onClick={() => navigate('/auth/role-selection')}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
          >
            {t('landing.nav.bookNow')}
          </button>
          <button
            className="md:hidden p-2 rounded-lg text-text-muted hover:text-primary"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-background-paper border-t border-border px-4 py-4 flex flex-col gap-3">
          {links.map(l => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} className="text-sm text-text-muted hover:text-primary transition-colors font-medium py-1">
              {l.label}
            </a>
          ))}
          <div className="flex gap-2 pt-2 border-t border-border">
            <button onClick={() => { navigate('/auth/login'); setMenuOpen(false) }} className="flex-1 py-2 rounded-lg text-sm font-medium text-primary border border-primary hover:bg-primary/10 transition-colors">
              {t('landing.nav.login')}
            </button>
            <button onClick={() => { navigate('/auth/role-selection'); setMenuOpen(false) }} className="flex-1 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors">
              {t('landing.nav.bookNow')}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function LandingHero() {
  const { t, isRTL } = useLanguage()
  const navigate = useNavigate()

  const badges = [
    {
      icon: <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
      title: t('landing.hero.badges.rating.title'),
      sub: t('landing.hero.badges.rating.sub'),
    },
    {
      icon: <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      title: t('landing.hero.badges.available.title'),
      sub: t('landing.hero.badges.available.sub'),
    },
    {
      icon: <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
      title: t('landing.hero.badges.certified.title'),
      sub: t('landing.hero.badges.certified.sub'),
    },
    {
      icon: <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
      title: t('landing.hero.badges.privacy.title'),
      sub: t('landing.hero.badges.privacy.sub'),
    },
  ]

  return (
    <section className="relative min-h-screen bg-background flex items-center overflow-hidden pt-16">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -start-32 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute top-1/2 -end-24 w-72 h-72 rounded-full bg-primary/6 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid lg:grid-cols-2 gap-12 items-center relative">
        <div className={`flex flex-col gap-6 lg:order-2`}>
          <div className="inline-flex self-start items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {t('landing.hero.badges.available.title')}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-heading leading-tight">
            {t('landing.hero.heading')}
          </h1>
          <p className="text-lg text-text-muted leading-relaxed max-w-lg">
            {t('landing.hero.subtitle')}
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate('/auth/role-selection')} className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shadow-card">
              {t('landing.hero.bookNow')}
            </button>
            <button onClick={() => navigate('/auth/register/patient')} className="px-6 py-3 rounded-xl border border-border bg-background-paper text-text font-semibold hover:border-primary hover:text-primary transition-colors">
              {t('landing.hero.freeAssessment')}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {badges.map(b => (
              <div key={b.title} className="flex items-center gap-3 p-3 rounded-xl bg-background-paper border border-border shadow-card">
                <div className="w-9 h-9 rounded-lg bg-background-subtle flex items-center justify-center shrink-0">
                  {b.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-heading">{b.title}</p>
                  <p className="text-xs text-text-muted">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`relative lg:order-1`}>
          <div className="relative rounded-3xl overflow-hidden shadow-card">
            <img src={heroImg} alt="Mental health support" className="w-full h-[420px] lg:h-[520px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
          </div>
          <div className="absolute -bottom-4 -start-4 bg-background-paper rounded-2xl p-4 shadow-card border border-border">
            <p className="text-2xl font-bold text-primary">98%</p>
            <p className="text-xs text-text-muted mt-0.5">{t('landing.stats.satisfaction.label')}</p>
          </div>
          <div className="absolute -top-4 -end-4 bg-background-paper rounded-2xl p-4 shadow-card border border-border">
            <p className="text-2xl font-bold text-primary">+10K</p>
            <p className="text-xs text-text-muted mt-0.5">{t('landing.stats.users.label')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Journey ──────────────────────────────────────────────────────────────────
function LandingJourney() {
  const { t } = useLanguage()

  const steps = [
    { title: t('landing.journey.step1.title'), desc: t('landing.journey.step1.desc'), icon: <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
    { title: t('landing.journey.step2.title'), desc: t('landing.journey.step2.desc'), icon: <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { title: t('landing.journey.step3.title'), desc: t('landing.journey.step3.desc'), icon: <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  ]

  return (
    <section className="py-20 bg-background-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-text-heading text-center mb-14">
          {t('landing.journey.title')}
        </h2>
        <div className="grid md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-14 inset-x-[16.67%] h-px border-t-2 border-dashed border-primary/30 pointer-events-none" />
          {steps.map((step, i) => (
            <div key={i} className="relative flex flex-col items-center text-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl bg-background-paper border border-border shadow-card flex items-center justify-center z-10">
                {step.icon}
                <span className="absolute -top-2 -end-2 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
              </div>
              <h3 className="text-lg font-semibold text-text-heading">{step.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed max-w-xs">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Emergency Band ───────────────────────────────────────────────────────────
function LandingEmergencyBand() {
  const { t } = useLanguage()
  const navigate = useNavigate()

  const cards = [
    {
      key: 'blackmail',
      title: t('landing.emergency.blackmail.title'),
      desc: t('landing.emergency.blackmail.desc'),
      cta: t('landing.emergency.blackmail.cta'),
      gradFrom: 'from-rose-500/10',
      iconColor: 'text-rose-500',
      btnClass: 'bg-rose-500 hover:bg-rose-600',
      icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    },
    {
      key: 'call',
      title: t('landing.emergency.call.title'),
      desc: t('landing.emergency.call.desc'),
      cta: t('landing.emergency.call.cta'),
      gradFrom: 'from-amber-500/10',
      iconColor: 'text-amber-500',
      btnClass: 'bg-amber-500 hover:bg-amber-600',
      icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
    },
    {
      key: 'danger',
      title: t('landing.emergency.danger.title'),
      desc: t('landing.emergency.danger.desc'),
      cta: t('landing.emergency.danger.cta'),
      gradFrom: 'from-red-600/10',
      iconColor: 'text-red-600',
      btnClass: 'bg-red-600 hover:bg-red-700',
      icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    },
  ]

  return (
    <section className="py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-3xl bg-background-paper border border-border shadow-card p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-text-heading text-center mb-6">
            {t('landing.emergency.title')}
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {cards.map(card => (
              <div key={card.key} className={`rounded-2xl bg-gradient-to-br ${card.gradFrom} to-transparent border border-border p-5 flex flex-col gap-3`}>
                <div className={`w-12 h-12 rounded-xl bg-background-paper border border-border flex items-center justify-center ${card.iconColor}`}>
                  {card.icon}
                </div>
                <h3 className="font-semibold text-text-heading">{card.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed flex-1">{card.desc}</p>
                <button onClick={() => navigate('/auth/login')} className={`mt-auto px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${card.btnClass}`}>
                  {card.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Services ─────────────────────────────────────────────────────────────────
function LandingServices() {
  const { t } = useLanguage()
  const navigate = useNavigate()

  const services = [
    { key: 'individual', title: t('landing.services.individual.title'), desc: t('landing.services.individual.desc'), icon: <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { key: 'relationships', title: t('landing.services.relationships.title'), desc: t('landing.services.relationships.desc'), icon: <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> },
    { key: 'children', title: t('landing.services.children.title'), desc: t('landing.services.children.desc'), icon: <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> },
    { key: 'family', title: t('landing.services.family.title'), desc: t('landing.services.family.desc'), icon: <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    { key: 'programs', title: t('landing.services.programs.title'), desc: t('landing.services.programs.desc'), icon: <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg> },
  ]

  return (
    <section id="services" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-12 gap-4 flex-wrap">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-heading">{t('landing.services.title')}</h2>
          <button onClick={() => navigate('/auth/role-selection')} className="text-sm font-semibold text-primary hover:underline shrink-0">
            {t('landing.services.viewAll')}
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map(s => (
            <div key={s.key} onClick={() => navigate('/auth/role-selection')} className="group p-6 rounded-2xl bg-background-paper border border-border shadow-card hover:border-primary hover:shadow-lg transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                {s.icon}
              </div>
              <h3 className="font-semibold text-text-heading mb-2">{s.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Doctor Card ──────────────────────────────────────────────────────────────
function DoctorCard({ doc, t, navigate }) {
  return (
    <div className="bg-background-paper rounded-2xl border border-border shadow-card overflow-hidden hover:border-primary transition-colors group">
      <div className="relative h-48 overflow-hidden">
        <img src={doc.img} alt={doc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-semibold text-text-heading">{doc.name}</h3>
        <p className="text-xs text-primary font-medium">{doc.specialty}</p>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          <span className="text-xs font-semibold text-text-heading">{doc.rating}</span>
          <span className="text-xs text-text-muted">({doc.reviews})</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm font-bold text-text-heading">
            {doc.price} <span className="text-xs font-normal text-text-muted">{t('landing.doctors.perSession')}</span>
          </span>
          <button onClick={() => navigate('/auth/role-selection')} className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors">
            {t('landing.doctors.bookNow')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Doctors ──────────────────────────────────────────────────────────────────
function LandingDoctors() {
  const { t, isRTL } = useLanguage()
  const navigate = useNavigate()
  const [activeIdx, setActiveIdx] = useState(0)

  const doctorData = [
    { img: doctor1, name: t("auto.drSarahAhmed"), specialty: t("auto.anxietyDepression"), rating: 4.9, reviews: 128, price: 350 },
    { img: doctor2, name: t("auto.drMohammedAli"), specialty: t("auto.familyTherapy"), rating: 4.8, reviews: 96, price: 400 },
    { img: doctor3, name: t("auto.drLaylaHassan"), specialty: t("auto.cognitiveTherapy"), rating: 4.9, reviews: 214, price: 450 },
    { img: doctor4, name: t("auto.drKarimMansour"), specialty: t("auto.adolescentHealth"), rating: 4.7, reviews: 73, price: 380 },
  ]

  return (
    <section id="doctors" className="py-20 bg-background-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-12 gap-4 flex-wrap">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-heading">{t('landing.doctors.title')}</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/auth/role-selection')} className="text-sm font-semibold text-primary hover:underline">
              {t('landing.doctors.viewAll')}
            </button>
            <button onClick={() => setActiveIdx(i => Math.max(0, i - 1))} className="w-9 h-9 rounded-full border border-border bg-background-paper hover:border-primary hover:text-primary flex items-center justify-center transition-colors" aria-label="Previous">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => setActiveIdx(i => Math.min(doctorData.length - 1, i + 1))} className="w-9 h-9 rounded-full border border-border bg-background-paper hover:border-primary hover:text-primary flex items-center justify-center transition-colors" aria-label="Next">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {doctorData.map((doc, i) => <DoctorCard key={i} doc={doc} t={t} navigate={navigate} />)}
        </div>
        <div className="md:hidden">
          <DoctorCard doc={doctorData[activeIdx]} t={t} navigate={navigate} />
          <div className="flex justify-center gap-2 mt-4">
            {doctorData.map((_, i) => (
              <button key={i} onClick={() => setActiveIdx(i)} className={`w-2 h-2 rounded-full transition-colors ${i === activeIdx ? 'bg-primary' : 'bg-border'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Assessment ───────────────────────────────────────────────────────────────
function LandingAssessment() {
  const { t, isRTL } = useLanguage()
  const navigate = useNavigate()

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-background-paper border border-border shadow-card overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            <div className={`relative h-72 lg:h-auto order-1`}>
              <img src={assessImg} alt="Assessment" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-primary/10" />
            </div>
            <div className={`flex flex-col justify-center gap-6 p-8 lg:p-12 order-2`}>
              <div className="inline-flex self-start items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                {t('landing.assessment.cta')}
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-text-heading leading-tight">
                {t('landing.assessment.title')}
              </h2>
              <p className="text-text-muted leading-relaxed">{t('landing.assessment.desc')}</p>
              <button onClick={() => navigate('/auth/register/patient')} className="self-start px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shadow-card">
                {t('landing.assessment.cta')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function LandingStats() {
  const { t } = useLanguage()
  const items = [
    { value: t('landing.stats.users.value'), label: t('landing.stats.users.label') },
    { value: t('landing.stats.doctors.value'), label: t('landing.stats.doctors.label') },
    { value: t('landing.stats.satisfaction.value'), label: t('landing.stats.satisfaction.label') },
    { value: t('landing.stats.available.value'), label: t('landing.stats.available.label') },
  ]
  return (
    <section className="py-16 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((item, i) => (
            <div key={i} className="text-center">
              <p className="text-4xl sm:text-5xl font-bold text-white mb-2">{item.value}</p>
              <p className="text-white/80 text-sm font-medium">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function LandingTestimonials() {
  const { t, language } = useLanguage()
  const images = [testimonial1, testimonial2, testimonial3]
  const items = translations[language]?.landing?.testimonials?.items || en.landing.testimonials.items || []

  return (
    <section className="py-20 bg-background-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-text-heading text-center mb-12">
          {t('landing.testimonials.title')}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} className="bg-background-paper rounded-2xl border border-border shadow-card p-6 flex flex-col gap-4">
              <svg className="w-8 h-8 text-primary/30" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-text-muted leading-relaxed flex-1">"{item.quote}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <img src={images[i]} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold text-text-heading">{item.name}</p>
                  <p className="text-xs text-text-muted">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function LandingFinalCTA() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  return (
    <section className="py-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="relative rounded-3xl bg-primary overflow-hidden py-16 px-8">
          <div className="absolute top-0 start-0 opacity-20 pointer-events-none">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <path d="M10 110 Q30 50, 80 20 Q40 60, 60 110 Z" fill="white" />
              <path d="M30 110 Q50 60, 100 30 Q60 70, 80 110 Z" fill="white" opacity="0.6" />
            </svg>
          </div>
          <div className="absolute bottom-0 end-0 opacity-20 pointer-events-none rotate-180">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <path d="M10 110 Q30 50, 80 20 Q40 60, 60 110 Z" fill="white" />
              <path d="M30 110 Q50 60, 100 30 Q60 70, 80 110 Z" fill="white" opacity="0.6" />
            </svg>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">{t('landing.finalCta.title')}</h2>
            <p className="text-white/80 text-lg max-w-xl">{t('landing.finalCta.desc')}</p>
            <button onClick={() => navigate('/auth/role-selection')} className="px-8 py-4 rounded-xl bg-white text-primary font-bold hover:bg-background-subtle transition-colors shadow-card text-base">
              {t('landing.finalCta.button')}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function LandingFooter() {
  const { t } = useLanguage()
  return (
    <footer className="bg-background-paper border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="text-sm text-text-muted leading-relaxed">{t('landing.footer.tagline')}</p>
          </div>
          <div>
            <h4 className="font-semibold text-text-heading mb-4">{t('landing.footer.quickLinks')}</h4>
            <ul className="flex flex-col gap-2">
              {[
                { label: t('landing.footer.home'), href: '#' },
                { label: t('landing.footer.services'), href: '#services' },
                { label: t('landing.footer.doctors'), href: '#doctors' },
                { label: t('landing.footer.articles'), href: '#' },
              ].map(l => (
                <li key={l.label}><a href={l.href} className="text-sm text-text-muted hover:text-primary transition-colors">{l.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-text-heading mb-4">{t('landing.footer.supportHelp')}</h4>
            <ul className="flex flex-col gap-2">
              {[t('landing.footer.faq'), t('landing.footer.privacy'), t('landing.footer.terms'), t('landing.footer.contactUs')].map(l => (
                <li key={l}><a href="#" className="text-sm text-text-muted hover:text-primary transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-text-heading mb-4">{t('landing.footer.contact')}</h4>
            <ul className="flex flex-col gap-3">
              <li className="flex items-center gap-2 text-sm text-text-muted">
                <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {t('landing.footer.phone')}
              </li>
              <li className="flex items-center gap-2 text-sm text-text-muted">
                <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {t('landing.footer.email')}
              </li>
              <li className="flex items-center gap-2 text-sm text-text-muted">
                <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {t('landing.footer.location')}
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border text-center text-sm text-text-muted">
          {t('landing.footer.rights')}
        </div>
      </div>
    </footer>
  )
}

// ─── Chat Bubble ──────────────────────────────────────────────────────────────
function ChatBubble() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate('/auth/login')}
      className="fixed bottom-6 end-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-white shadow-card hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
      aria-label={t('landing.chat.start')}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <span className="text-sm font-semibold">{t('landing.chat.start')}</span>
    </button>
  )
}

// ─── Root Page ────────────────────────────────────────────────────────────────
const LandingPage = () => {
  const { isRTL } = useLanguage()
  return (
    <div  className="min-h-screen bg-background">
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingJourney />
        <LandingEmergencyBand />
        <LandingServices />
        <LandingDoctors />
        <LandingAssessment />
        <LandingStats />
        <LandingTestimonials />
        <LandingFinalCTA />
      </main>
      <LandingFooter />
      <ChatBubble />
    </div>
  )
}

export default LandingPage
