"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination, DataTableToolbar } from "@/components/data-table"
import { categoriesColumns as columns } from "./components/categories-columns"
import { getCategories, type CategoryFilters } from "./data/categories"
import { DataTableBulkActions } from "./components/data-table-bulk-actions"
import { categoryStatuses, categoryFeaturedOptions } from "./data/data"
import { handleServerError } from "@/lib/handle-server-error"
import { Button } from "@/components/ui/button"
import { CategoryParentCombobox } from "./components/category-parent-combobox"

export function CategoriesTable() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  // Get search query and filters from URL
  const search = searchParams.get("search") || ""
  const parentId = searchParams.get("parent_id")
    ? parseInt(searchParams.get("parent_id")!, 10)
    : null
  const page = parseInt(searchParams.get("page") || "1", 10)
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10)

  // Build filters for API call
  const filters: CategoryFilters = useMemo(() => {
    const sortBy = sorting[0]?.id || "name"
    const sortDir = sorting[0]?.desc ? "desc" : "asc"

    return {
      search: search || undefined,
      parent_id: parentId !== null ? parentId : undefined,
      per_page: pageSize,
      sort_by: sortBy,
      sort_dir: sortDir,
      page,
    }
  }, [search, parentId, page, pageSize, sorting])

  // Fetch categories from API
  const { data, isLoading, error } = useQuery({
    queryKey: ["categories", filters],
    queryFn: () => getCategories(filters),
    retry: 1,
  })

  // Handle errors using handleServerError
  useEffect(() => {
    if (error) {
      handleServerError(error)
    }
  }, [error])

  const rawCategories = data?.data || []
  const meta = data?.meta

  // Client-side status filter state
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  // Client-side featured filter state
  const [featuredFilter, setFeaturedFilter] = useState<string[]>([])

  // Filter categories client-side by status and featured
  const categories = useMemo(() => {
    let filtered = rawCategories

    // Filter by status
    if (statusFilter.length > 0) {
      filtered = filtered.filter((category) => {
        const status = category.is_active ? "active" : "inactive"
        return statusFilter.includes(status)
      })
    }

    // Filter by featured
    if (featuredFilter.length > 0) {
      filtered = filtered.filter((category) => {
        const featured = category.featured ? "featured" : "not_featured"
        return featuredFilter.includes(featured)
      })
    }

    return filtered
  }, [rawCategories, statusFilter, featuredFilter])

  // Handle pagination changes via URL
  const handlePaginationChange = useMemo(
    () => (pageIndex: number, newPageSize: number) => {
      const params = new URLSearchParams(searchParams.toString())
      const newPage = pageIndex + 1

      if (newPage > 1) {
        params.set("page", newPage.toString())
      } else {
        params.delete("page")
      }

      if (newPageSize !== 10) {
        params.set("pageSize", newPageSize.toString())
      } else {
        params.delete("pageSize")
      }

      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  // Handle search changes via URL
  const handleSearchChange = useMemo(
    () => (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set("search", value)
      } else {
        params.delete("search")
      }
      params.delete("page") // Reset to first page on search
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  // Debounced search handler to prevent too many API calls
  const [searchInputValue, setSearchInputValue] = useState(search)

  // Update local state when URL search changes (e.g., from reset button)
  useEffect(() => {
    setSearchInputValue(search)
  }, [search])

  // Debounce the actual search API call
  useEffect(() => {
    // Skip if values are already in sync
    if (searchInputValue === search) {
      return
    }

    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (searchInputValue) {
        params.set("search", searchInputValue)
      } else {
        params.delete("search")
      }
      params.delete("page") // Reset to first page on search
      router.push(`${pathname}?${params.toString()}`)
    }, 500) // 500ms debounce delay

    return () => clearTimeout(timeoutId)
  }, [searchInputValue, search, searchParams, router, pathname])

  // Handle search input changes (server-side with debouncing)
  const handleSearchInputChange = useCallback((value: string) => {
    setSearchInputValue(value)
  }, [])

  // Handle parent filter changes (server-side)
  const handleParentFilterChange = (value: number | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value !== null) {
      params.set("parent_id", value.toString())
    } else {
      params.delete("parent_id")
    }
    params.delete("page") // Reset to first page on filter change
    router.push(`${pathname}?${params.toString()}`)
  }

  // Handle status filter changes (client-side)
  const handleStatusFilterChange = (values: string[]) => {
    setStatusFilter(values)
  }

  // Handle featured filter changes (client-side)
  const handleFeaturedFilterChange = (values: string[]) => {
    setFeaturedFilter(values)
  }

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: categories,
    columns,
    state: {
      sorting,
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
      rowSelection,
      columnFilters: [], // Not used - we handle filtering manually
      columnVisibility,
    },
    pageCount: meta?.last_page ?? 1,
    enableRowSelection: true,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true, // All filtering is handled manually
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex: page - 1, pageSize })
          : updater
      handlePaginationChange(next.pageIndex, next.pageSize)
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(sorting) : updater
      setSorting(next)
      // Update URL with new sorting
      const params = new URLSearchParams(searchParams.toString())
      if (next[0]) {
        params.set("sort_by", next[0].id)
        params.set("sort_dir", next[0].desc ? "desc" : "asc")
      } else {
        params.delete("sort_by")
        params.delete("sort_dir")
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })


  if (error) {
    // Error is handled by React Query, but we show a user-friendly message
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-destructive font-medium">Error loading categories</p>
        <p className="text-muted-foreground text-sm text-center">
          {error instanceof Error
            ? error.message
            : "Unable to load categories. Please try again."}
        </p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          size="sm"
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "max-sm:has-[div[role='toolbar']]:mb-16",
        "flex flex-1 flex-col gap-4"
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder="Filter categories..."
        searchKey="name"
        searchValue={searchInputValue}
        onSearchChange={handleSearchInputChange}
        customFilters={
          <CategoryParentCombobox
            value={parentId}
            onValueChange={handleParentFilterChange}
            placeholder="Filter by parent..."
            className="h-8 w-[180px]"
          />
        }
        filters={[
          {
            columnId: "is_active",
            title: "Status",
            options: categoryStatuses.map((status) => ({
              label: status.label,
              value: status.value,
              count: rawCategories.filter((cat) => {
                const catStatus = cat.is_active ? "active" : "inactive"
                return catStatus === status.value
              }).length,
            })),
            value: statusFilter,
            onChange: handleStatusFilterChange,
          },
          {
            columnId: "featured",
            title: "Featured",
            options: categoryFeaturedOptions.map((option) => ({
              label: option.label,
              value: option.value,
              count: rawCategories.filter((cat) => {
                const catFeatured = cat.featured ? "featured" : "not_featured"
                return catFeatured === option.value
              }).length,
            })),
            value: featuredFilter,
            onChange: handleFeaturedFilterChange,
          },
        ]}
      />
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="group/row">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        "bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
                        header.column.columnDef.meta?.className,
                        header.column.columnDef.meta?.thClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="group/row"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className="mt-auto" />
      <DataTableBulkActions table={table} />
    </div>
  )
}

