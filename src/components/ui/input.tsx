import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "./label"

export interface InputProps extends React.ComponentProps<"input"> {
  label: string
  description?: string
  isTextArea?: boolean
  note?: string
}

const InputField = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, description, note, isTextArea = false, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
InputField.displayName = "InputField"

const TextAreaField = React.forwardRef<HTMLTextAreaElement, InputProps>(
  ({ className, label, description, note, isTextArea = false, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-y",
        className
      )}
      ref={ref}
      {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
    />
  )
)
TextAreaField.displayName = "TextAreaField"

const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ isTextArea = false, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={props.id}>{props.label}</Label>
        {props.description && (
          <p className="text-sm text-muted-foreground">{props.description}</p>
        )}
        {isTextArea ? (
          <TextAreaField {...props} ref={ref as React.Ref<HTMLTextAreaElement>} />
        ) : (
          <InputField {...props} ref={ref as React.Ref<HTMLInputElement>} />
        )}
        {props.note && <p className="text-sm text-muted-foreground">{props.note}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
