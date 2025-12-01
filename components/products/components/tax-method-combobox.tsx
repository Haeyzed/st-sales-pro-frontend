"use client"

import * as React from "react"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"

interface TaxMethodComboboxProps {
  value?: number | null
  onValueChange?: (value: number | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

const taxMethodOptions: ComboboxOption[] = [
  { value: "1", label: "Exclusive" },
  { value: "2", label: "Inclusive" },
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
      onValueChange?.(parseInt(newValue))
    }
  }

  return (
    <Combobox
      options={taxMethodOptions}
      value={value?.toString()}
      onValueChange={handleValueChange}
      placeholder={placeholder}
      searchPlaceholder="Search method..."
      emptyText="No method found."
      disabled={disabled}
      className={className}
    />
  )
}

