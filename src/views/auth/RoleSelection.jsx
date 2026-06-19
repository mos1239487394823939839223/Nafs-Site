import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, ArrowRight, Video, Headphones, MessageCircle, Home, Globe } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useLanguage } from '../../contexts/LanguageContext'

export default function RoleSelection() {
  const navigate = useNavigate()
  const { t, language, toggleLanguage } = useLanguage()
  const isAr = language === "ar"
  const consultationTypes = [
    { icon: Video, title: isAr ? "استشارات الفيديو" : "Video consultations", desc: isAr ? "جلسة مرئية مباشرة مع المعالج." : "A direct video session with your therapist." },
    { icon: Headphones, title: isAr ? "الاستشارات الصوتية" : "Audio consultations", desc: isAr ? "تحدث براحتك عبر مكالمة صوتية." : "Talk comfortably through an audio call." },
    { icon: MessageCircle, title: isAr ? "الاستشارات الكتابية" : "Written consultations", desc: isAr ? "استشارة مرنة عبر الكتابة والشات." : "Flexible consultation through chat and writing." },
  ]

  const roles = [
    {
      id: 'patient',
      title: t('auth.patientTitle'),
      description: t('auth.patientDesc'),
      icon: User,
      color: 'from-primary to-primary-dark',
      features: [
        t('auth.bookVideoConsultations'),
        t('auth.accessMedicalRecords'),
        t('auth.aiHealthAssistant'),
        t('auth.trackHealthMetrics'),
        t('auth.emergencySupport'),
        t('auth.violenceBlackmailSupport'),
      ],
      route: '/auth/register/patient',
    },

  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4 py-6">
      {/* ── Floating Top Bar ── */}
      <div className="fixed top-4 inset-x-4 z-50 flex items-center justify-between pointer-events-none">
        <button
          onClick={() => navigate('/')}
          className="pointer-events-auto flex items-center gap-2 bg-background-paper/90 backdrop-blur-md border border-border shadow-lg rounded-full px-4 py-2 text-sm font-semibold text-text-heading hover:text-primary hover:border-primary/40 transition-all duration-200"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">{t('auth.backToHome', 'Home')}</span>
        </button>
        <button
          onClick={toggleLanguage}
          className="pointer-events-auto flex items-center gap-2 bg-background-paper/90 backdrop-blur-md border border-border shadow-lg rounded-full px-4 py-2 text-sm font-semibold text-text-heading hover:text-primary hover:border-primary/40 transition-all duration-200"
        >
          <Globe className="w-4 h-4" />
          <span>{language === 'ar' ? 'English' : 'العربية'}</span>
        </button>
      </div>
      <div className="w-full max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-5 sm:mb-6"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-heading mb-2">
            {t('auth.roleSelection').split(' ')[0]} <span className="text-primary">{t('auth.platformName')}</span>
          </h1>
          <p className="text-sm sm:text-base text-text-muted max-w-2xl mx-auto px-2">
            {t('auth.roleSelectionSubtitle')}
          </p>
        </motion.div>

        {/* Role Cards */}
        <div className="flex justify-center">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="bg-background-paper rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 h-full flex flex-col border border-border w-full max-w-md">
                {/* Header with Gradient */}
                <div className={`bg-gradient-to-r ${role.color} p-4 sm:p-6 text-white relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                      <role.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-white">{role.title}</h2>
                      <p className="text-white/90 relative z-10 text-xs sm:text-sm">{role.description}</p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="p-4 sm:p-6 flex-1">
                  <h3 className="font-semibold text-text-heading mb-2 text-sm">{t('auth.whatYouGet')}</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {role.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-text-muted text-xs sm:text-sm">
                        <div className="w-4 h-4 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 border-t border-border pt-4">
                    <h3 className="mb-2 font-bold text-text-heading text-sm">{isAr ? "اختر طريقة الاستشارة المناسبة لك" : "Choose your preferred consultation type"}</h3>
                    <div className="grid gap-2">
                      {consultationTypes.map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="flex items-center gap-3 rounded-xl border border-border bg-background-subtle/60 p-2.5 text-start">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-text-heading">{title}</p>
                            <p className="mt-0.5 text-[11px] sm:text-xs text-text-muted">{desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-4 sm:p-6 pt-0">
                  <Button
                    onClick={() => navigate(role.route)}
                    className="w-full group"
                    variant={role.id === 'patient' ? 'primary' : 'secondary'}
                  >
                    <span>{t('auth.getStarted')}</span>
                    <ArrowRight className="w-5 h-5 ms-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-5 text-center"
        >
          <p className="text-text-muted text-sm">
            {t('auth.hasAccount')}{' '}
            <button
              onClick={() => navigate('/auth/login')}
              className="text-primary font-medium hover:underline"
            >
              {t('auth.login')}
            </button>
          </p>
          <p className="text-xs text-text-muted mt-2">
            {t('auth.adminAccessNote')}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
