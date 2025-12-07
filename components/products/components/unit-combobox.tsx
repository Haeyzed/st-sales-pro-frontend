"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { apiGetClient } from "@/lib/api-client-client"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"

type UnitDropdownItem = {
  id: number
  name: string
  code: string
}

interface UnitComboboxProps {
  value?: number | null
  onValueChange?: (value: number | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  onAddClick?: () => void
}

export function UnitCombobox({
  value,
  onValueChange,
  placeholder = "Select unit",
  disabled = false,
  className,
  onAddClick,
}: UnitComboboxProps) {
  const { data: units, isLoading } = useQuery({
    queryKey: ["unit-dropdown"],
    queryFn: async () => {
      const response = await apiGetClient<UnitDropdownItem[]>("units/dropdown")
      return response.data
    },
  })

  const options: ComboboxOption[] = React.useMemo(() => {
    if (!units) return []
    return units.map((unit) => ({
      value: unit.id.toString(),
      label: `${unit.name}`,
    }))
  }, [units])

  const handleValueChange = (newValue: string | undefined) => {
    if (newValue === undefined) {
      onValueChange?.(null)
    } else {
      onValueChange?.(newValue ? Number.parseInt(newValue, 10) : null)
    }
  }

  return (
    <Combobox
      options={options}
      value={value !== null && value !== undefined ? String(value) : undefined}
      onValueChange={handleValueChange}
      placeholder={placeholder}
      searchPlaceholder="Search units..."
      emptyText="No units found."
      disabled={disabled || isLoading}
      className={className}
      loading={isLoading}
      onAddClick={onAddClick}
      addButtonText="Add unit"
    />
  )
}

