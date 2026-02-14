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
                    isCompleted && 'bg-primary text-white',
                    isActive && 'bg-primary text-white ring-4 ring-primary/20',
                    !isCompleted && !isActive && 'bg-background-subtle text-text-muted'
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      'text-sm font-medium transition-colors',
                      (isActive || isCompleted) ? 'text-primary' : 'text-text-muted'
                    )}
                  >
                    {step.title}
                  </p>
                  {step.subtitle && (
                    <p className="text-xs text-text-muted/70 mt-0.5">{step.subtitle}</p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 -mt-10">
                  <div
                    className={cn(
                      'h-full transition-all duration-300',
                      isCompleted ? 'bg-primary' : 'bg-background-subtle'
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-6 w-full bg-background-subtle rounded-full h-2 overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  )
}
