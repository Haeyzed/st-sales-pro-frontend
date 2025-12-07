"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { apiGetClient } from "@/lib/api-client-client"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"

type TaxDropdownItem = {
  id: number
  name: string
  rate: number
}

interface TaxComboboxProps {
  value?: number | null
  onValueChange?: (value: number | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  onAddClick?: () => void
}

export function TaxCombobox({
  value,
  onValueChange,
  placeholder = "Select tax",
  disabled = false,
  className,
  onAddClick,
}: TaxComboboxProps) {
  const { data: taxes, isLoading } = useQuery({
    queryKey: ["tax-dropdown"],
    queryFn: async () => {
      const response = await apiGetClient<TaxDropdownItem[]>("taxes/dropdown")
      return response.data
    },
  })

  const options: ComboboxOption[] = React.useMemo(() => {
    if (!taxes) return []
    return taxes.map((tax) => ({
      value: tax.id.toString(),
      label: `${tax.name}`,
    }))
  }, [taxes])

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
      searchPlaceholder="Search taxes..."
      emptyText="No taxes found."
      disabled={disabled || isLoading}
      className={className}
      loading={isLoading}
      onAddClick={onAddClick}
      addButtonText="Add tax"
    />
  )
}

