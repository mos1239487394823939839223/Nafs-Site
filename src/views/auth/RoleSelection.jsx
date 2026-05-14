import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, ArrowRight } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useLanguage } from '../../contexts/LanguageContext'

export default function RoleSelection() {
  const navigate = useNavigate()
  const { t } = useLanguage()

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
      ],
      route: '/auth/register/patient',
    },

  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4 py-8">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-heading mb-3 sm:mb-4">
            {t('auth.roleSelection').split(' ')[0]} <span className="text-primary">{t('auth.platformName')}</span>
          </h1>
          <p className="text-base sm:text-xl text-text-muted max-w-2xl mx-auto px-2">
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
                <div className={`bg-gradient-to-r ${role.color} p-5 sm:p-8 text-white relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 relative z-10">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                      <role.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white">{role.title}</h2>
                    </div>
                  </div>
                  <p className="text-white/90 relative z-10 text-sm sm:text-base">{role.description}</p>
                </div>

                {/* Features */}
                <div className="p-5 sm:p-8 flex-1">
                  <h3 className="font-semibold text-text-heading mb-3 sm:mb-4">{t('auth.whatYouGet')}</h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {role.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-text-muted text-sm sm:text-base">
                        <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <div className="p-5 sm:p-8 pt-0">
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
          className="mt-12 text-center"
        >
          <p className="text-text-muted">
            {t('auth.hasAccount')}{' '}
            <button
              onClick={() => navigate('/auth/login')}
              className="text-primary font-medium hover:underline"
            >
              {t('auth.login')}
            </button>
          </p>
          <p className="text-sm text-text-muted mt-4">
            {t('auth.adminAccessNote')}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
