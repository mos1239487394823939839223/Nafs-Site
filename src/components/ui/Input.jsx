import { Input as NextUIInput, Textarea as NextUITextarea } from "@nextui-org/react";
import { cn } from '../../lib/utils'

export default function Input({
  label,
  error,
  className,
  type = 'text',
  ...props
}) {
  return (
    <NextUIInput
      type={type}
      label={label}
      isInvalid={!!error}
      errorMessage={error}
      variant="bordered"
      radius="lg"
      labelPlacement="outside"
      classNames={{
        inputWrapper: "bg-background-subtle/50 hover:bg-background-subtle focus-within:bg-background shadow-none",
        input: "text-text",
        label: "text-text-muted font-medium z-0"
      }}
      className={className}
      {...props}
    />
  )
}

export function Select({ label, error, className, children, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-muted mb-2">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200 bg-background-subtle/50 hover:bg-background-subtle focus:bg-background text-text cursor-pointer appearance-none',
          error ? 'border-red-500 focus:ring-red-500/10' : 'border-transparent hover:border-border',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

export function Textarea({ label, error, className, ...props }) {
  return (
    <NextUITextarea
      label={label}
      isInvalid={!!error}
      errorMessage={error}
      variant="bordered"
      radius="lg"
      labelPlacement="outside"
      classNames={{
        inputWrapper: "bg-background-subtle/50 hover:bg-background-subtle focus-within:bg-background shadow-none",
        input: "text-text",
        label: "text-text-muted font-medium z-0"
      }}
      className={className}
      {...props}
    />
  )
}
