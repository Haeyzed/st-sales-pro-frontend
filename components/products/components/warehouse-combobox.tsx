"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { apiGetClient } from "@/lib/api-client-client"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"

type WarehouseDropdownItem = {
  id: number
  name: string
}

interface WarehouseComboboxProps {
  value?: number | null
  onValueChange?: (value: number | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function WarehouseCombobox({
  value,
  onValueChange,
  placeholder = "Select warehouse",
  disabled = false,
  className,
}: WarehouseComboboxProps) {
  const { data: warehouses, isLoading } = useQuery({
    queryKey: ["warehouse-dropdown"],
    queryFn: async () => {
      const response = await apiGetClient<WarehouseDropdownItem[]>("warehouses/dropdown")
      return response.data
    },
  })

  const options: ComboboxOption[] = React.useMemo(() => {
    if (!warehouses) return []
    return warehouses.map((warehouse) => ({
      value: warehouse.id.toString(),
      label: warehouse.name,
    }))
  }, [warehouses])

  const handleValueChange = (newValue: string | undefined) => {
    if (newValue === undefined) {
      onValueChange?.(null)
    } else {
      onValueChange?.(parseInt(newValue, 10))
    }
  }

  return (
    <Combobox
      options={options}
      value={value?.toString()}
      onValueChange={handleValueChange}
      placeholder={placeholder}
      searchPlaceholder="Search warehouses..."
      emptyText="No warehouses found."
      disabled={disabled || isLoading}
      className={className}
      loading={isLoading}
    />
  )
}

