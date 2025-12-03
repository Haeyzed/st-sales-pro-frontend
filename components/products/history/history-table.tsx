"use client"

import { useState, useMemo, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  type SortingState,
  type VisibilityState,
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
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { Label } from "@/components/ui/label"
import { Filter } from "lucide-react"
import { saleHistoryColumns } from "./sale-history-columns"
import { purchaseHistoryColumns } from "./purchase-history-columns"
import {
  getProductSaleHistory,
  getProductPurchaseHistory,
  getProductSaleReturnHistory,
  getProductPurchaseReturnHistory,
  type ProductHistoryFilters,
} from "@/components/products/data/products"
import { handleServerError } from "@/lib/handle-server-error"
import { format } from "date-fns"
import { DatePickerWithRange } from "@/components/ui/date-picker-range"
import { type DateRange } from "react-day-picker"
import { WarehouseCombobox } from "@/components/products/components/warehouse-combobox"

interface HistoryTableProps {
  productId: number
}

export function HistoryTable({ productId }: HistoryTableProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [showFilters, setShowFilters] = useState(false)

  // Get active tab from URL or default to sales
  const activeTab = searchParams.get("tab") || "sales"

  // Get filters from URL
  const startingDate = searchParams.get("starting_date") || format(new Date(new Date().setFullYear(new Date().getFullYear() - 1)), "yyyy-MM-dd")
  const endingDate = searchParams.get("ending_date") || format(new Date(), "yyyy-MM-dd")
  const warehouseId = searchParams.get("warehouse_id")
    ? parseInt(searchParams.get("warehouse_id")!, 10)
    : null
  const searchQuery = searchParams.get("search") || ""
  const page = parseInt(searchParams.get("page") || "1", 10)
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10)
  
  // Local search input state
  const [searchInputValue, setSearchInputValue] = useState(searchQuery)

  // Date range state
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(startingDate),
    to: new Date(endingDate),
  })

  // Build filters for API call
  const filters: ProductHistoryFilters = useMemo(() => {
    return {
      starting_date: format(dateRange.from, "yyyy-MM-dd"),
      ending_date: format(dateRange.to, "yyyy-MM-dd"),
      warehouse_id: warehouseId,
      search: searchQuery || undefined,
      per_page: pageSize,
      page,
    }
  }, [dateRange, warehouseId, searchQuery, page, pageSize])

  // Fetch data based on active tab
  const getHistoryQuery = () => {
    switch (activeTab) {
      case "purchases":
        return getProductPurchaseHistory(productId, filters)
      case "sale-returns":
        return getProductSaleReturnHistory(productId, filters)
      case "purchase-returns":
        return getProductPurchaseReturnHistory(productId, filters)
      default:
        return getProductSaleHistory(productId, filters)
    }
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["product-history", activeTab, productId, filters],
    queryFn: getHistoryQuery,
    retry: 1,
  })

  // Handle errors
  useEffect(() => {
    if (error) {
      handleServerError(error)
    }
  }, [error])

  const historyData = data?.data || []
  const meta = data?.meta

  // Get columns based on active tab
  const columns = useMemo(() => {
    if (activeTab === "purchases" || activeTab === "purchase-returns") {
      return purchaseHistoryColumns
    }
    return saleHistoryColumns
  }, [activeTab])

  // Handle tab change
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    params.delete("page") // Reset to first page on tab change
    router.push(`${pathname}?${params.toString()}`)
  }

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange({ from: range.from, to: range.to })
      const params = new URLSearchParams(searchParams.toString())
      params.set("starting_date", format(range.from, "yyyy-MM-dd"))
      params.set("ending_date", format(range.to, "yyyy-MM-dd"))
      params.delete("page") // Reset to first page on filter change
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  // Handle warehouse filter change
  const handleWarehouseFilterChange = (value: number | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value !== null) {
      params.set("warehouse_id", value.toString())
    } else {
      params.delete("warehouse_id")
    }
    params.delete("page") // Reset to first page on filter change
    router.push(`${pathname}?${params.toString()}`)
  }

  // Handle search input change with debounce
  const handleSearchInputChange = (value: string) => {
    setSearchInputValue(value)
  }

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (searchInputValue) {
        params.set("search", searchInputValue)
      } else {
        params.delete("search")
      }
      params.delete("page") // Reset to first page on search
      
      // Only update if search value actually changed
      if (searchInputValue !== searchQuery) {
        router.push(`${pathname}?${params.toString()}`)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(handler)
  }, [searchInputValue, pathname, router, searchParams, searchQuery])

  // Handle pagination changes
  const handlePaginationChange = (pageIndex: number, newPageSize: number) => {
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
  }

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: historyData,
    columns,
    state: {
      sorting,
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
      columnVisibility,
    },
    pageCount: meta?.last_page ?? 1,
    enableRowSelection: false,
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
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-destructive font-medium">Error loading history</p>
        <p className="text-muted-foreground text-sm text-center">
          {error instanceof Error
            ? error.message
            : "Unable to load history. Please try again."}
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
    <div className={cn("flex flex-1 flex-col gap-4")}>
      {/* Search and Filter Toggle */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <DataTableToolbar
            table={table}
            searchPlaceholder={
              activeTab === "sales"
                ? "Search by reference, customer..."
                : activeTab === "purchases"
                ? "Search by reference, supplier..."
                : activeTab === "sale-returns"
                ? "Search by reference, customer..."
                : "Search by reference, supplier..."
            }
            searchKey="reference_no"
            searchValue={searchInputValue}
            onSearchChange={handleSearchInputChange}
            filters={[]}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="h-8"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 min-w-0">
            <Label>Date Range</Label>
            <DatePickerWithRange
              value={dateRange}
              onChange={handleDateRangeChange}
            />
          </div>
          <div className="space-y-2 min-w-0">
            <Label>Warehouse</Label>
            <WarehouseCombobox
              value={warehouseId}
              onValueChange={handleWarehouseFilterChange}
              placeholder="All Warehouses"
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
          <TabsTrigger value="sale-returns">Sale Returns</TabsTrigger>
          <TabsTrigger value="purchase-returns">Purchase Returns</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
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
                            "bg-background group-hover/row:bg-muted",
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
                      <div className="flex justify-center">
                        <Spinner />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="group/row">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "bg-background group-hover/row:bg-muted",
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
                      No records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination table={table} className="mt-auto" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

