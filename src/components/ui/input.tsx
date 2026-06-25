import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, type, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink-2">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg border border-line bg-surface/50 px-3 py-2 text-sm text-ink ring-offset-bg placeholder:text-ink-3 transition-colors hover:border-line-hover",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-danger focus-visible:ring-danger/40",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = React.useId()
    const textareaId = id ?? generatedId
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-ink-2">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            "flex min-h-[80px] w-full rounded-lg border border-line bg-surface/50 px-3 py-2 text-sm text-ink placeholder:text-ink-3 transition-colors resize-none hover:border-line-hover",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-danger focus-visible:ring-danger/40",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, placeholder, ...props }, ref) => {
    const generatedId = React.useId()
    const selectId = id ?? generatedId
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-ink-2">
            {label}
          </label>
        )}
        <select
          id={selectId}
          className={cn(
            "flex h-10 w-full rounded-lg border border-line bg-surface/50 px-3 py-2 text-sm text-ink transition-colors appearance-none hover:border-line-hover",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-danger focus-visible:ring-danger/40",
            className
          )}
          ref={ref}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
      </div>
    )
  }
)
Select.displayName = "Select"

export { Input, Textarea, Select }
