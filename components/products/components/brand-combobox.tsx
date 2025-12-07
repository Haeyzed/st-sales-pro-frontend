"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"
import { getBrandDropdown } from "@/components/brands/data/brands"

interface BrandComboboxProps {
  value?: number | null
  onValueChange?: (value: number | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  onAddClick?: () => void
}

export function BrandCombobox({
  value,
  onValueChange,
  placeholder = "Select brand",
  disabled = false,
  className,
  onAddClick,
}: BrandComboboxProps) {
  const { data: brands, isLoading } = useQuery({
    queryKey: ["brand-dropdown"],
    queryFn: getBrandDropdown,
  })

  const options: ComboboxOption[] = React.useMemo(() => {
    if (!brands) return []
    return brands.map((brand) => ({
      value: brand.id.toString(),
      label: brand.title,
      image: brand.image_url ?? undefined,
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
      loading={isLoading}
      onAddClick={onAddClick}
      addButtonText="Add brand"
    />
  )
}

