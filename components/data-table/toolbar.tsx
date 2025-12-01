"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { type Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableFacetedFilter } from "./faceted-filter"
import { DataTableViewOptions } from "./view-options"

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  searchPlaceholder?: string
  searchKey?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  filters?: {
    columnId: string
    title: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
      count?: number
    }[]
    value?: string[]
    onChange?: (values: string[]) => void
  }[]
  customFilters?: React.ReactNode
  parentId?: number | null
  onParentIdChange?: (value: number | null) => void
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Filter...",
  searchKey,
  searchValue,
  onSearchChange,
  filters = [],
  customFilters,
  parentId,
  onParentIdChange,
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    (searchValue && searchValue.length > 0) ||
    (parentId !== null && parentId !== undefined) ||
    filters.some((f) => f.value && f.value.length > 0) ||
    table.getState().columnFilters.length > 0 ||
    table.getState().globalFilter

  const handleReset = () => {
    if (onSearchChange) {
      onSearchChange("")
    }
    if (onParentIdChange) {
      onParentIdChange(null)
    }
    filters.forEach((filter) => {
      if (filter.onChange) {
        filter.onChange([])
      }
    })
    table.resetColumnFilters()
    table.setGlobalFilter("")
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Top row: Search and View Options */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 items-center gap-2">
          {searchKey ? (
            <Input
              placeholder={searchPlaceholder}
              value={searchValue ?? (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
              onChange={(event) => {
                const value = event.target.value
                if (onSearchChange) {
                  onSearchChange(value)
                } else {
                  table.getColumn(searchKey)?.setFilterValue(value)
                }
              }}
              className="h-8 w-[150px] lg:w-[250px]"
            />
          ) : (
            <Input
              placeholder={searchPlaceholder}
              value={table.getState().globalFilter ?? ""}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              className="h-8 w-[150px] lg:w-[250px]"
            />
          )}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={handleReset}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <Cross2Icon className="ms-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <DataTableViewOptions table={table} />
      </div>
      
      {/* Bottom row: Filters */}
      {(customFilters || filters.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {customFilters}
          {filters.map((filter) => {
            // If filter has custom onChange, use custom filter component
            if (filter.onChange !== undefined) {
              return (
                <DataTableFacetedFilter
                  key={filter.columnId}
                  column={undefined}
                  title={filter.title}
                  options={filter.options}
                  value={filter.value}
                  onChange={filter.onChange}
                />
              )
            }
            // Otherwise use table column
            const column = table.getColumn(filter.columnId)
            if (!column) return null
            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
