import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import React from "react"

interface FormFieldProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  maxLength?: number
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
  maxLength,
  onKeyPress,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-900 font-medium">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-500 ${className}`}
        maxLength={maxLength}
        onKeyPress={onKeyPress}
      />
    </div>
  )
}
