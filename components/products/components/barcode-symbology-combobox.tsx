"use client"

import * as React from "react"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"

interface BarcodeSymbologyComboboxProps {
  value?: string | null
  onValueChange?: (value: string | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

const barcodeSymbologyOptions: ComboboxOption[] = [
  { value: "C128", label: "Code 128" },
  { value: "C39", label: "Code 39" },
  { value: "UPCA", label: "UPC-A" },
  { value: "UPCE", label: "UPC-E" },
  { value: "EAN8", label: "EAN-8" },
  { value: "EAN13", label: "EAN-13" },
]

export function BarcodeSymbologyCombobox({
  value,
  onValueChange,
  placeholder = "Select barcode symbology...",
  disabled = false,
  className,
}: BarcodeSymbologyComboboxProps) {
  const handleValueChange = (newValue: string | undefined) => {
    if (newValue === undefined) {
      onValueChange?.(null)
    } else {
      onValueChange?.(newValue)
    }
  }

  return (
    <Combobox
      options={barcodeSymbologyOptions}
      value={value?.toString()}
      onValueChange={handleValueChange}
      placeholder={placeholder}
      searchPlaceholder="Search symbology..."
      emptyText="No symbology found."
      disabled={disabled}
      className={className}
    />
  )
}

