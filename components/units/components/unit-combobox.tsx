"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { getUnitDropdown } from "../data/units"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"

interface UnitComboboxProps {
  value?: number | null
  onValueChange?: (value: number | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  excludeId?: number // Exclude this unit ID (useful when editing to prevent selecting self as base unit)
}

export function UnitCombobox({
  value,
  onValueChange,
  placeholder = "Select base unit (optional)",
  disabled = false,
  className,
  excludeId,
}: UnitComboboxProps) {
  const { data: units, isLoading } = useQuery({
    queryKey: ["unit-dropdown"],
    queryFn: getUnitDropdown,
  })

  // Transform units to combobox options
  const options: ComboboxOption[] = React.useMemo(() => {
    if (!units) return []

    return units
      .filter((unit) => {
        // Exclude the current unit if editing
        if (excludeId && unit.id === excludeId) return false
        return true
      })
      .map((unit) => ({
        value: unit.id.toString(),
        label: `${unit.unit_code} - ${unit.unit_name}`,
      }))
  }, [units, excludeId])

  const handleValueChange = (newValue: string | undefined) => {
    if (newValue === undefined) {
      onValueChange?.(null)
    } else {
      onValueChange?.(Number.parseInt(newValue, 10))
    }
  }

  return (
    <Combobox
      options={options}
      value={value?.toString()}
      onValueChange={handleValueChange}
      placeholder={placeholder}
      searchPlaceholder="Search units..."
      emptyText="No units found."
      disabled={disabled}
      className={className}
    />
  )
}
