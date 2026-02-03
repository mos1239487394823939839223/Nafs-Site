import { Activity, Pill, AlertCircle, FileText } from 'lucide-react'

export default function QuickSummary({ patientData, isOpen, onToggle }) {
  if (!patientData) return null

  return (
    <div
      className={`
        bg-white border-l border-border h-full overflow-y-auto
        transition-all duration-300
        ${isOpen ? 'w-80' : 'w-0 overflow-hidden'}
      `}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text">Quick Summary</h3>
          <button
            onClick={onToggle}
            className="lg:hidden text-text-light hover:text-text"
          >
            ✕
          </button>
        </div>

        {/* Vital Signs */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-primary" />
            <h4 className="font-medium text-text text-sm">Vital Signs</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-background-gray rounded-xl">
              <span className="text-sm text-text-light">Heart Rate</span>
              <span className="text-sm font-semibold text-text">
                {patientData.vitals?.heartRate} bpm
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-background-gray rounded-xl">
              <span className="text-sm text-text-light">Blood Pressure</span>
              <span className="text-sm font-semibold text-text">
                {patientData.vitals?.bloodPressure}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-background-gray rounded-xl">
              <span className="text-sm text-text-light">Temperature</span>
              <span className="text-sm font-semibold text-text">
                {patientData.vitals?.temperature}°F
              </span>
            </div>
          </div>
        </div>

        {/* Recent Tests */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-secondary" />
            <h4 className="font-medium text-text text-sm">Recent Tests</h4>
          </div>
          <div className="space-y-2">
            {patientData.recentTests?.map((test, index) => (
              <div key={index} className="p-3 bg-background-gray rounded-xl">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium text-text">{test.name}</span>
                  <span className={`
                    text-xs px-2 py-0.5 rounded-full
                    ${test.status === 'Normal' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                    }
                  `}>
                    {test.status}
                  </span>
                </div>
                <span className="text-xs text-text-light">{test.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Medications */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Pill className="w-4 h-4 text-accent" />
            <h4 className="font-medium text-text text-sm">Current Medications</h4>
          </div>
          <div className="space-y-2">
            {patientData.medications?.map((med, index) => (
              <div key={index} className="p-2 bg-accent/10 rounded-xl">
                <span className="text-sm text-text">{med}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Allergies */}
        {patientData.allergies && patientData.allergies.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <h4 className="font-medium text-text text-sm">Allergies</h4>
            </div>
            <div className="space-y-2">
              {patientData.allergies.map((allergy, index) => (
                <div key={index} className="p-2 bg-red-50 border border-red-200 rounded-xl">
                  <span className="text-sm text-red-700 font-medium">{allergy}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
