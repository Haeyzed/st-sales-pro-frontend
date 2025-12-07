"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { getCategoryDropdown } from "../data/categories"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"

interface CategoryComboboxProps {
  value?: number | null
  onValueChange?: (value: number | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  excludeId?: number // Exclude this category ID (useful when editing to prevent selecting self as parent)
}

export function CategoryCombobox({
  value,
  onValueChange,
  placeholder = "Select parent category (optional)",
  disabled = false,
  className,
  excludeId,
}: CategoryComboboxProps) {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["category-dropdown"],
    queryFn: getCategoryDropdown,
  })

  // Transform categories to combobox options
  const options: ComboboxOption[] = React.useMemo(() => {
    if (!categories) return []
    
    return categories
      .filter((category) => {
        // Exclude the current category if editing
        if (excludeId && category.id === excludeId) return false
        return true
      })
      .map((category) => ({
        value: category.id.toString(),
        label: category.name,
        image: category?.image_url || undefined,
      }))
  }, [categories, excludeId])

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
      searchPlaceholder="Search categories..."
      emptyText="No categories found."
      disabled={disabled || isLoading}
      className={className}
      loading={isLoading}
    />
  )
}

