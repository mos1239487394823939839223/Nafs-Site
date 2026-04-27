import { Users, Clock, DollarSign } from 'lucide-react'
import { useLanguage } from '../../../contexts/LanguageContext'

export default function HistoryStats({ stats }) {
  const { t, isRTL } = useLanguage()

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="bg-background-paper p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-muted">{t('admin.totalPatients', 'Total Patients')}</span>
          <Users className="w-5 h-5 text-primary" />
        </div>
        <p className="text-2xl font-bold text-text-heading" dir="ltr">{stats.totalPatients}</p>
      </div>

      <div className="bg-background-paper p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-muted">{t('common.totalHours', 'Total Hours')}</span>
          <Clock className="w-5 h-5 text-orange-500" />
        </div>
        <p className="text-2xl font-bold text-text-heading" dir="ltr">{stats.totalHours}h</p>
      </div>

      <div className="bg-background-paper p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-muted">{t('admin.totalRevenue', 'Earnings')}</span>
          <DollarSign className="w-5 h-5 text-green-500" />
        </div>
        <p className="text-2xl font-bold text-text-heading" dir="ltr">${stats.earnings}</p>
      </div>
    </div>
  )
}
