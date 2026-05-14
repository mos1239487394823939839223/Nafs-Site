import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, Mail, Home } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useLanguage } from '../../contexts/LanguageContext'

export default function PendingApproval() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-background-paper rounded-2xl shadow-xl p-5 sm:p-8 md:p-12 text-center border border-border">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 sm:w-24 sm:h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
          >
            <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-600" />
          </motion.div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-text-heading mb-3 sm:mb-4">
            {t('auth.pendingApprovalTitle')}
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-text-muted mb-6 sm:mb-8">
            {t('auth.pendingApprovalDesc')}
          </p>

          {/* Status Timeline */}
          <div className="bg-background-subtle p-6 rounded-lg mb-8 text-start">
            <h3 className="font-semibold text-text-heading mb-4">{t('auth.whatHappensNext')}</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-text-heading">{t('auth.applicationReceived')}</p>
                  <p className="text-sm text-text-muted">{t('auth.applicationReceivedDesc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-text-heading">{t('auth.underReview')}</p>
                  <p className="text-sm text-text-muted">{t('auth.underReviewDesc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-text-heading">{t('auth.approvalNotification')}</p>
                  <p className="text-sm text-text-muted">{t('auth.approvalNotificationDesc')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg mb-8">
            <p className="text-sm text-emerald-800">
              {t('auth.pendingNote')}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
            >
              <Home className="w-4 h-4 me-2" />
              {t('auth.backToHome')}
            </Button>
            <Button
              onClick={() => navigate('/auth/login')}
            >
              {t('auth.goToLogin')}
            </Button>
          </div>

          {/* Contact */}
          <p className="text-sm text-text-muted mt-8">
            {t('auth.contactUs')}{' '}
            <a href="mailto:support@clinc.com" className="text-primary hover:underline">
              support@clinc.com
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
