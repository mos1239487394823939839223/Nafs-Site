import { ShowChart as Activity, Medication as Pill, ErrorOutline as AlertCircle, Description as FileText } from '@mui/icons-material'
import { useLanguage } from '../../contexts/LanguageContext'

export default function QuickSummary({ patientData, isOpen, onToggle }) {
  const { t, isRTL } = useLanguage()
  if (!patientData) return null

  return (
    <div
      className={`
        bg-background-paper ${isRTL ? 'border-r' : 'border-l'} border-border h-full overflow-y-auto
        transition-all duration-300
        ${isOpen ? 'w-80' : 'w-0 overflow-hidden'}
      `}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="p-4">
        {/* Header */}
        <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h3 className="font-semibold text-text">{t('patient.quickSummary', 'Quick Summary')}</h3>
          <button
            onClick={onToggle}
            className="lg:hidden text-text-muted hover:text-text"
          >
            ✕
          </button>
        </div>

        {/* Vital Signs */}
        <div className="mb-6">
          <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            <Activity className="w-4 h-4 text-primary" />
            <h4 className="font-medium text-text text-sm">{t('patient.vitalSigns', 'Vital Signs')}</h4>
          </div>
          <div className="space-y-2">
            <div className={`flex justify-between items-center p-2 bg-background-subtle rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-sm text-text-muted">{t('patient.heartRate', 'Heart Rate')}</span>
              <span className="text-sm font-semibold text-text" dir="ltr">
                {patientData.vitals?.heartRate} {t('patient.bpm', 'bpm')}
              </span>
            </div>
            <div className={`flex justify-between items-center p-2 bg-background-subtle rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-sm text-text-muted">{t('patient.bloodPressure')}</span>
              <span className="text-sm font-semibold text-text" dir="ltr">
                {patientData.vitals?.bloodPressure}
              </span>
            </div>
            <div className={`flex justify-between items-center p-2 bg-background-subtle rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-sm text-text-muted">{t('patient.temperature', 'Temperature')}</span>
              <span className="text-sm font-semibold text-text" dir="ltr">
                {patientData.vitals?.temperature}°F
              </span>
            </div>
          </div>
        </div>

        {/* Recent Tests */}
        <div className="mb-6">
          <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            <FileText className="w-4 h-4 text-secondary" />
            <h4 className="font-medium text-text text-sm">{t('patient.recentTests', 'Recent Tests')}</h4>
          </div>
          <div className="space-y-2">
            {patientData.recentTests?.map((test, index) => (
              <div key={index} className="p-3 bg-background-subtle rounded-xl">
                <div className={`flex justify-between items-start mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-sm font-medium text-text">{test.name}</span>
                  <span className={`
                    text-xs px-2 py-0.5 rounded-full
                    ${test.status === 'Normal'
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                    }
                  `}>
                    {test.status}
                  </span>
                </div>
                <span className={`text-xs text-text-light block ${isRTL ? 'text-right' : 'text-left'}`} dir="ltr">{test.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Medications */}
        <div className="mb-6">
          <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            <Pill className="w-4 h-4 text-accent" />
            <h4 className="font-medium text-text text-sm">{t('patient.currentMedications', 'Current Medications')}</h4>
          </div>
          <div className="space-y-2">
            {patientData.medications?.map((med, index) => (
              <div key={index} className={`p-2 bg-accent/10 rounded-xl ${isRTL ? 'text-right' : 'text-left'}`}>
                <span className="text-sm text-text">{med}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Allergies */}
        {patientData.allergies && patientData.allergies.length > 0 && (
          <div className="mb-6">
            <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
              <AlertCircle className="w-4 h-4 text-red-500" />
              <h4 className="font-medium text-text text-sm">{t('patient.allergies', 'Allergies')}</h4>
            </div>
            <div className="space-y-2">
              {patientData.allergies.map((allergy, index) => (
                <div key={index} className={`p-2 bg-red-500/10 border border-red-500/20 rounded-xl ${isRTL ? 'text-right' : 'text-left'}`}>
                  <span className="text-sm text-red-600 dark:text-red-400 font-medium">{allergy}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
