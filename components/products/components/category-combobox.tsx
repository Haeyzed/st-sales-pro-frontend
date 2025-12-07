"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { getCategoryDropdown } from "@/components/categories/data/categories"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"

interface CategoryComboboxProps {
  value?: number | null
  onValueChange?: (value: number | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  onAddClick?: () => void
}

export function CategoryCombobox({
  value,
  onValueChange,
  placeholder = "Select category",
  disabled = false,
  className,
  onAddClick,
}: CategoryComboboxProps) {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["category-dropdown"],
    queryFn: getCategoryDropdown,
  })

  const options: ComboboxOption[] = React.useMemo(() => {
    if (!categories) return []
    return categories.map((category) => ({
      value: category.id.toString(),
      label: category.name,
      image: category?.image_url || undefined,
    }))
  }, [categories])

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
      searchPlaceholder="Search categories..."
      emptyText="No categories found."
      disabled={disabled || isLoading}
      className={className}
      loading={isLoading}
      onAddClick={onAddClick}
      addButtonText="Add category"
    />
  )
}

