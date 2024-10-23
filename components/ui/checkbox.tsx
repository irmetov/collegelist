import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="flex items-center space-x-2 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            ref={ref}
            {...props}
          />
          <div
            className={cn(
              "w-4 h-4 border border-gray-300 rounded",
              "flex items-center justify-center",
              "transition-colors duration-200 ease-in-out",
              props.checked && "bg-primary border-primary",
              className
            )}
          >
            {props.checked && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
        {label && <span className="text-sm">{label}</span>}
      </label>
    )
  }
)

Checkbox.displayName = "Checkbox"

export { Checkbox }
