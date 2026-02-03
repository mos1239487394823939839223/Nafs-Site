import { cn } from '../../lib/utils'
import { Check } from 'lucide-react'

export default function ProgressStepper({ steps, currentStep }) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isActive = stepNumber === currentStep
          const isCompleted = stepNumber < currentStep

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300',
                    isCompleted && 'bg-medical-blue text-white',
                    isActive && 'bg-medical-blue text-white ring-4 ring-medical-lightBlue',
                    !isCompleted && !isActive && 'bg-gray-200 text-gray-500'
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      'text-sm font-medium transition-colors',
                      (isActive || isCompleted) ? 'text-medical-blue' : 'text-gray-500'
                    )}
                  >
                    {step.title}
                  </p>
                  {step.subtitle && (
                    <p className="text-xs text-gray-400 mt-0.5">{step.subtitle}</p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 -mt-10">
                  <div
                    className={cn(
                      'h-full transition-all duration-300',
                      isCompleted ? 'bg-medical-blue' : 'bg-gray-200'
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-6 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-medical-blue h-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  )
}
