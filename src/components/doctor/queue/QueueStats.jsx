import { Users, Clock, CheckCircle } from 'lucide-react'
import { useLanguage } from '../../../contexts/LanguageContext'

export default function QueueStats({ stats }) {
  const { t, isRTL } = useLanguage()
  return (
    <div className={`grid grid-cols-3 gap-4 mb-6 text-start`} >
      <div className="bg-background-paper p-4 rounded-xl border border-border shadow-sm">
        <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-sm text-text-muted">{t('doctor.waiting', 'Waiting')}</span>
          <Users className="w-4 h-4 text-emerald-500" />
        </div>
        <p className="text-2xl font-bold text-text-heading">{stats.waiting}</p>
      </div>

      <div className="bg-background-paper p-4 rounded-xl border border-border shadow-sm">
        <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-sm text-text-muted">{t('doctor.avgWait', 'Avg Wait')}</span>
          <Clock className="w-4 h-4 text-orange-500" />
        </div>
        <p className="text-2xl font-bold text-text-heading" dir="ltr">{stats.avgWait} {t('common.min', 'min')}</p>
      </div>

      <div className="bg-background-paper p-4 rounded-xl border border-border shadow-sm">
        <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-sm text-text-muted">{t('doctor.completed', 'Completed')}</span>
          <CheckCircle className="w-4 h-4 text-green-500" />
        </div>
        <p className="text-2xl font-bold text-text-heading">{stats.completed}</p>
      </div>
    </div>
  )
}
