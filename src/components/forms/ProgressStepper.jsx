import { cn } from '../../lib/utils'
import { Check } from '@mui/icons-material'

export default function ProgressStepper({ steps, currentStep }) {
  return (
    <div className="w-full py-6 flex flex-col items-center">
      <div className="flex items-center justify-between w-full max-w-sm relative">
        {/* Background Progress Track */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-background-subtle -z-10" />
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-5 left-0 h-0.5 bg-primary -z-10 transition-all duration-500 ease-in-out"
          style={{ 
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
          }}
        />

        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isActive = stepNumber === currentStep
          const isCompleted = stepNumber < currentStep

          return (
            <div key={step.id} className="flex flex-col items-center relative flex-1">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 z-10',
                  isCompleted ? 'bg-primary text-white' : '',
                  isActive ? 'bg-primary text-white ring-4 ring-primary/20' : '',
                  !isCompleted && !isActive ? 'bg-background-subtle text-text-muted' : ''
                )}
              >
                {/* Content removed */}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
