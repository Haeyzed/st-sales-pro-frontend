"use client"

import { useState, useMemo, useEffect } from "react"
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
import { categoryStatuses } from "./data/data"
import { handleServerError } from "@/lib/handle-server-error"
import { Button } from "@/components/ui/button"

export function CategoriesTable() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  // Get search query from URL
  const search = searchParams.get("search") || ""
  const page = parseInt(searchParams.get("page") || "1", 10)
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10)

  // Build filters for API call
  const filters: CategoryFilters = useMemo(() => {
    const sortBy = sorting[0]?.id || "name"
    const sortDir = sorting[0]?.desc ? "desc" : "asc"

    return {
      search: search || undefined,
      per_page: pageSize,
      sort_by: sortBy,
      sort_dir: sortDir,
      page,
    }
  }, [search, page, pageSize, sorting])

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

  const categories = data?.data || []
  const meta = data?.meta

  // Get column filters from table state
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Initialize column filters with search from URL
  const initialColumnFilters = useMemo<ColumnFiltersState>(() => {
    if (search) {
      return [{ id: "name", value: search }]
    }
    return []
  }, [search])

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
      columnFilters: columnFilters.length > 0 ? columnFilters : initialColumnFilters,
      columnVisibility,
    },
    pageCount: meta?.last_page ?? 1,
    enableRowSelection: true,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex: page - 1, pageSize })
          : updater
      handlePaginationChange(next.pageIndex, next.pageSize)
    },
    onColumnFiltersChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(columnFilters) : updater
      setColumnFilters(next)
      // Update URL with search from name column filter
      const nameFilter = next.find((f) => f.id === "name")
      const searchValue = (nameFilter?.value as string) || ""
      handleSearchChange(searchValue)
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
        filters={[
          {
            columnId: "is_active",
            title: "Status",
            options: categoryStatuses.map((status) => ({
              label: status.label,
              value: status.value,
            })),
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

