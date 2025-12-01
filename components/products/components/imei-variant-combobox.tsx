"use client"

import * as React from "react"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"

interface ImeiVariantComboboxProps {
  value?: "imei" | "variant" | null
  onValueChange?: (value: "imei" | "variant" | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

const imeiVariantOptions: ComboboxOption[] = [
  { value: "imei", label: "IMEI" },
  { value: "variant", label: "Variant" },
]

export function ImeiVariantCombobox({
  value,
  onValueChange,
  placeholder = "Filter by IMEI/Variant...",
  disabled = false,
  className,
}: ImeiVariantComboboxProps) {
  const handleValueChange = (newValue: string | undefined) => {
    if (newValue === undefined) {
      onValueChange?.(null)
    } else if (newValue === "imei" || newValue === "variant") {
      onValueChange?.(newValue)
    }
  }

  return (
    <Combobox
      options={imeiVariantOptions}
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

