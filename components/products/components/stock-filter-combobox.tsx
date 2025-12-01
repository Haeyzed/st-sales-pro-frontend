"use client"

import * as React from "react"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"

interface StockFilterComboboxProps {
  value?: "with" | "without" | null
  onValueChange?: (value: "with" | "without" | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

const stockFilterOptions: ComboboxOption[] = [
  { value: "with", label: "With Stock" },
  { value: "without", label: "Without Stock" },
]

export function StockFilterCombobox({
  value,
  onValueChange,
  placeholder = "Filter by stock...",
  disabled = false,
  className,
}: StockFilterComboboxProps) {
  const handleValueChange = (newValue: string | undefined) => {
    if (newValue === undefined) {
      onValueChange?.(null)
    } else if (newValue === "with" || newValue === "without") {
      onValueChange?.(newValue)
    }
  }

  return (
    <Combobox
      options={stockFilterOptions}
      value={value || undefined}
      onValueChange={handleValueChange}
      placeholder={placeholder}
      searchPlaceholder="Search..."
      emptyText="No options found."
      disabled={disabled}
      className={className}
    />
  )
}

