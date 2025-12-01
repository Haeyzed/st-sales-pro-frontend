"use client"

import * as React from "react"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"

interface GuaranteeTypeComboboxProps {
  value?: string | null
  onValueChange?: (value: string | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

const guaranteeTypeOptions: ComboboxOption[] = [
  { value: "days", label: "Days" },
  { value: "months", label: "Months" },
  { value: "years", label: "Years" },
]

export function GuaranteeTypeCombobox({
  value,
  onValueChange,
  placeholder = "Select type...",
  disabled = false,
  className,
}: GuaranteeTypeComboboxProps) {
  const handleValueChange = (newValue: string | undefined) => {
    if (newValue === undefined) {
      onValueChange?.(null)
    } else {
      onValueChange?.(newValue)
    }
  }

  return (
    <Combobox
      options={guaranteeTypeOptions}
      value={value?.toString()}
      onValueChange={handleValueChange}
      placeholder={placeholder}
      searchPlaceholder="Search type..."
      emptyText="No type found."
      disabled={disabled}
      className={className}
    />
  )
}

