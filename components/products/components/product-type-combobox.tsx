"use client"

import * as React from "react"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"

interface ProductTypeComboboxProps {
  value?: string | null
  onValueChange?: (value: string | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

const productTypeOptions: ComboboxOption[] = [
  { value: "standard", label: "Standard" },
  { value: "combo", label: "Combo" },
  { value: "digital", label: "Digital" },
  { value: "service", label: "Service" },
]

export function ProductTypeCombobox({
  value,
  onValueChange,
  placeholder = "Filter by type...",
  disabled = false,
  className,
}: ProductTypeComboboxProps) {
  const handleValueChange = (newValue: string | undefined) => {
    if (newValue === undefined) {
      onValueChange?.(null)
    } else {
      onValueChange?.(newValue)
    }
  }

  return (
    <Combobox
      options={productTypeOptions}
      value={value?.toString()}
      onValueChange={handleValueChange}
      placeholder={placeholder}
      searchPlaceholder="Search types..."
      emptyText="No types found."
      disabled={disabled}
      className={className}
    />
  )
}

