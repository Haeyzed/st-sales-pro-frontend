"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { apiGetClient } from "@/lib/api-client-client"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"

type BrandDropdownItem = {
  id: number
  title: string
}

interface BrandComboboxProps {
  value?: number | null
  onValueChange?: (value: number | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function BrandCombobox({
  value,
  onValueChange,
  placeholder = "Select brand (optional)",
  disabled = false,
  className,
}: BrandComboboxProps) {
  const { data: brands, isLoading } = useQuery({
    queryKey: ["brand-dropdown"],
    queryFn: async () => {
      const response = await apiGetClient<BrandDropdownItem[]>("brands/dropdown")
      return response.data
    },
  })

  const options: ComboboxOption[] = React.useMemo(() => {
    if (!brands) return []
    return brands.map((brand) => ({
      value: brand.id.toString(),
      label: brand.title,
    }))
  }, [brands])

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
      searchPlaceholder="Search brands..."
      emptyText="No brands found."
      disabled={disabled || isLoading}
      className={className}
    />
  )
}

