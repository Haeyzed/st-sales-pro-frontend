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
}

export function CategoryCombobox({
  value,
  onValueChange,
  placeholder = "Select category",
  disabled = false,
  className,
}: CategoryComboboxProps) {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["category-dropdown"],
    queryFn: getCategoryDropdown,
  })

  const options: ComboboxOption[] = React.useMemo(() => {
    if (!categories) return []
    return categories.map((cat) => ({
      value: cat.id.toString(),
      label: cat.name,
    }))
  }, [categories])

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

