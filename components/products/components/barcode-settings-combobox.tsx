"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { apiGetClient } from "@/lib/api-client-client"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"

type BarcodeSetting = {
  id: number
  name: string
  description: string | null
  width: number
  height: number
  is_default: boolean
}

interface BarcodeSettingsComboboxProps {
  value?: number | null
  onValueChange?: (value: number | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function BarcodeSettingsCombobox({
  value,
  onValueChange,
  placeholder = "Select barcode setting...",
  disabled = false,
  className,
}: BarcodeSettingsComboboxProps) {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["barcode-settings"],
    queryFn: async () => {
      const response = await apiGetClient<BarcodeSetting[]>("barcodes/dropdown")
      return response.data
    },
  })

  const options: ComboboxOption[] = React.useMemo(() => {
    if (!settings) return []
    return settings.map((setting) => ({
      value: String(setting.id),
      label: setting.description 
        ? `${setting.name} - ${setting.description}` 
        : setting.name,
    }))
  }, [settings])

  const handleValueChange = (newValue: string | null) => {
    if (newValue === null) {
      onValueChange?.(null)
    } else {
      onValueChange?.(parseInt(newValue, 10))
    }
  }

  return (
    <Combobox
      options={options}
      value={value !== null && value !== undefined ? String(value) : null}
      onValueChange={handleValueChange}
      placeholder={placeholder}
      emptyText="No barcode settings found"
      searchPlaceholder="Search barcode settings..."
      disabled={disabled || isLoading}
      className={className}
    />
  )
}

