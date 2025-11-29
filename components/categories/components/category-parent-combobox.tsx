"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { getParentCategories } from "../data/categories"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"

interface CategoryParentComboboxProps {
  value?: number | null
  onValueChange?: (value: number | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function CategoryParentCombobox({
  value,
  onValueChange,
  placeholder = "Filter by parent...",
  disabled = false,
  className,
}: CategoryParentComboboxProps) {
  const { data: parentCategories, isLoading } = useQuery({
    queryKey: ["category-parents"],
    queryFn: getParentCategories,
  })

  // Transform parent categories to combobox options
  const options: ComboboxOption[] = React.useMemo(() => {
    if (!parentCategories) return []
    
    return parentCategories.map((cat) => ({
      value: cat.id.toString(),
      label: cat.name,
    }))
  }, [parentCategories])

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
      searchPlaceholder="Search parent categories..."
      emptyText="No parent categories found."
      disabled={disabled}
      className={className}
    />
  )
}

