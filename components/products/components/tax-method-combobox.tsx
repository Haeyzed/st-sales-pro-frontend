"use client"

import * as React from "react"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"

interface TaxMethodComboboxProps {
  value?: string | null
  onValueChange?: (value: string | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

const taxMethodOptions: ComboboxOption[] = [
  { value: "exclusive", label: "Exclusive" },
  { value: "inclusive", label: "Inclusive" },
]

export function TaxMethodCombobox({
  value,
  onValueChange,
  placeholder = "Select tax method...",
  disabled = false,
  className,
}: TaxMethodComboboxProps) {
  const handleValueChange = (newValue: string | undefined) => {
    if (newValue === undefined) {
      onValueChange?.(null)
    } else {
      onValueChange?.(newValue)
    }
  }

  return (
    <Combobox
      options={taxMethodOptions}
      value={value}
      onValueChange={handleValueChange}
      placeholder={placeholder}
      searchPlaceholder="Search method..."
      emptyText="No method found."
      disabled={disabled}
      className={className}
    />
  )
}

