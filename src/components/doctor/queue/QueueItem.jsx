import { motion } from 'framer-motion'
import { AccessTime as Clock, PlayArrow as Play, Cancel as XCircle } from '@mui/icons-material'
import Button from '../../ui/Button'
import { useLanguage } from '../../../contexts/LanguageContext'

export default function QueueItem({ patient, onAction }) {
    const { t, isRTL } = useLanguage()
    const statusColors = {
        waiting: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        confirmed: 'bg-green-500/10 text-green-500 border-green-500/20',
        'in-progress': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        completed: 'bg-green-500/10 text-green-500 border-green-500/20',
        cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-background-paper p-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {/* Patient Info */}
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                    {patient.name.charAt(0)}
                </div>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-text-heading">{patient.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[patient.status]} capitalize`}>
                            {t(`bookingStatus.${patient.status}`, patient.status)}
                        </span>
                    </div>
                    <div className={`flex items-center gap-4 text-sm text-text-muted mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Clock className="w-3 h-3" />
                            {t('doctor.waited', 'Waited')}: {patient.waitTime} {t('common.min', 'min')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className={`flex items-center gap-2 self-end md:self-auto ${isRTL ? 'flex-row-reverse' : ''}`}>
                {(patient.status === 'waiting' || patient.status === 'confirmed') && (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            className={`text-red-600 hover:bg-red-50 border-red-100 hover:border-red-200 ${isRTL ? 'flex-row-reverse' : ''}`}
                            onClick={() => onAction('no-show', patient.id)}
                        >
                            <XCircle className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                            {t('doctor.noShow', 'No Show')}
                        </Button>
                        <Button
                            size="sm"
                            className={`bg-primary hover:bg-primary-dark text-white ${isRTL ? 'flex-row-reverse' : ''}`}
                            onClick={() => onAction('start', patient.id)}
                        >
                            <Play className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                            {t('doctor.startSession', 'Start Session')}
                        </Button>
                    </>
                )}

                {patient.status === 'in-progress' && (
                    <Button
                        size="sm"
                        className={`bg-[#dcfce7] hover:bg-[#bbf7d0] text-green-700 border border-green-300 ${isRTL ? 'flex-row-reverse' : ''}`}
                        onClick={() => onAction('complete', patient.id)}
                    >
                        <CheckCircle className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {t('doctor.completeSession', 'Complete Session')}
                    </Button>
                )}
            </div>
        </motion.div>
    )
}

function CheckCircle({ className }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    )
}
