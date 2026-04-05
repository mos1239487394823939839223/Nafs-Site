import { motion } from 'framer-motion'
import { Description as FileText, AccessTime as Clock, CheckCircle, ErrorOutline as AlertCircle } from '@mui/icons-material'
import Badge from '../../ui/Badge'
import Button from '../../ui/Button'
import { useLanguage } from '../../../contexts/LanguageContext'

export default function HistoryList({ sessions, onNoteClick }) {
    const { t, isRTL } = useLanguage()
    const getStatusBadge = (outcome) => {
        if (outcome === t('bookingStatus.completed')) {
            return <Badge variant="success">{t('bookingStatus.completed', 'Completed')}</Badge>
        } else if (outcome === t('bookingStatus.inProgress')) {
            return <Badge variant="warning">{t('bookingStatus.inProgress', 'Follow-up')}</Badge>
        } else if (outcome === t('bookingStatus.cancelled')) {
            return <Badge variant="error" className="bg-red-100 text-red-700">{t('bookingStatus.cancelled', 'Cancelled')}</Badge>
        } else {
            return <Badge variant="default">{outcome}</Badge>
        }
    }

    return (
        <div className={`bg-background-paper rounded-xl border border-border shadow-sm overflow-hidden ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-background-subtle border-b border-border">
                        <tr>
                            <th className={`px-6 py-4 text-sm font-semibold text-text-muted ${isRTL ? 'text-right' : 'text-left'}`}>{t('admin.dateAndTime', 'Date & Time')}</th>
                            <th className={`px-6 py-4 text-sm font-semibold text-text-muted ${isRTL ? 'text-right' : 'text-left'}`}>{t('common.patient', 'Patient')}</th>
                            <th className={`px-6 py-4 text-sm font-semibold text-text-muted ${isRTL ? 'text-right' : 'text-left'}`}>{t('common.type', 'Type')}</th>
                            <th className={`px-6 py-4 text-sm font-semibold text-text-muted ${isRTL ? 'text-right' : 'text-left'}`}>{t('doctor.duration', 'Duration')}</th>
                            <th className={`px-6 py-4 text-sm font-semibold text-text-muted ${isRTL ? 'text-right' : 'text-left'}`}>{t('common.status', 'Outcome')}</th>
                            <th className={`px-6 py-4 text-sm font-semibold text-text-muted ${isRTL ? 'text-left' : 'text-right'}`}>{t('common.actions', 'Actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sessions.map((session, index) => (
                            <motion.tr
                                key={session.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-background-subtle transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-text-heading">{session.date}</span>
                                        <span className="text-xs text-text-muted">{session.time}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                            {session.patientName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-text-heading">{session.patientName}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-text-muted">{session.type}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-sm text-text-muted">
                                        <Clock className="w-3.5 h-3.5" />
                                        {session.duration}{t('common.min', 'm')}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {getStatusBadge(session.outcome)}
                                </td>
                                <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-primary hover:bg-primary/5"
                                        onClick={() => onNoteClick?.(session)}
                                    >
                                        <FileText className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                        {t('common.notes', 'Notes')}
                                    </Button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {sessions.length === 0 && (
                <div className="p-8 text-center text-text-muted">
                    {t('doctor.noSessionsFound', 'No past sessions found.')}
                </div>
            )}
        </div>
    )
}
