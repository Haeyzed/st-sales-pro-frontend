"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
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
import { productsColumns as columns } from "./components/products-columns"
import { getProducts, type ProductFilters } from "./data/products"
import { DataTableBulkActions } from "./components/data-table-bulk-actions"
import { productStatuses, productTypes, stockFilters } from "./data/data"
import { handleServerError } from "@/lib/handle-server-error"
import { Button } from "@/components/ui/button"
import { CategoryCombobox } from "./components/category-combobox"
import { BrandCombobox } from "./components/brand-combobox"
import { UnitCombobox } from "./components/unit-combobox"
import { TaxCombobox } from "./components/tax-combobox"
import { ProductTypeCombobox } from "./components/product-type-combobox"
import { ImeiVariantCombobox } from "./components/imei-variant-combobox"
import { StockFilterCombobox } from "./components/stock-filter-combobox"
import { WarehouseCombobox } from "./components/warehouse-combobox"

export function ProductsTable() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  // Get search query and filters from URL
  const search = searchParams.get("search") || ""
  const productType = searchParams.get("product_type") || null
  const brandId = searchParams.get("brand_id")
    ? parseInt(searchParams.get("brand_id")!, 10)
    : null
  const categoryId = searchParams.get("category_id")
    ? parseInt(searchParams.get("category_id")!, 10)
    : null
  const unitId = searchParams.get("unit_id")
    ? parseInt(searchParams.get("unit_id")!, 10)
    : null
  const taxId = searchParams.get("tax_id")
    ? parseInt(searchParams.get("tax_id")!, 10)
    : null
  const warehouseId = searchParams.get("warehouse_id")
    ? parseInt(searchParams.get("warehouse_id")!, 10)
    : null
  const imeiVariant = searchParams.get("is_imei")
    ? "imei"
    : searchParams.get("is_variant")
    ? "variant"
    : null
  const stockFilter = searchParams.get("stock_filter") || null
  const page = parseInt(searchParams.get("page") || "1", 10)
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10)

  // Build filters for API call
  const filters: ProductFilters = useMemo(() => {
    const sortBy = sorting[0]?.id || "name"
    const sortDir = sorting[0]?.desc ? "desc" : "asc"

    return {
      search: search || undefined,
      product_type: productType ? (productType as any) : undefined,
      brand_id: brandId !== null ? brandId : undefined,
      category_id: categoryId !== null ? categoryId : undefined,
      unit_id: unitId !== null ? unitId : undefined,
      tax_id: taxId !== null ? taxId : undefined,
      warehouse_id: warehouseId !== null ? warehouseId : undefined,
      is_variant: imeiVariant === "variant" ? true : undefined,
      is_imei: imeiVariant === "imei" ? true : undefined,
      stock_filter: stockFilter ? (stockFilter as any) : undefined,
      per_page: pageSize,
      sort_by: sortBy,
      sort_dir: sortDir,
      page,
    }
  }, [search, productType, brandId, categoryId, unitId, taxId, warehouseId, imeiVariant, stockFilter, page, pageSize, sorting])

  // Fetch products from API
  const { data, isLoading, error } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => getProducts(filters),
    retry: 1,
  })

  // Handle errors using handleServerError
  useEffect(() => {
    if (error) {
      handleServerError(error)
    }
  }, [error])

  const rawProducts = data?.data || []
  const meta = data?.meta

  // Client-side status filter state
  const [statusFilter, setStatusFilter] = useState<string[]>([])

  // Filter products client-side by status
  const products = useMemo(() => {
    let filtered = rawProducts

    // Filter by status
    if (statusFilter.length > 0) {
      filtered = filtered.filter((product) => {
        const status = product.is_active ? "active" : "inactive"
        return statusFilter.includes(status)
      })
    }

    return filtered
  }, [rawProducts, statusFilter])

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

  // Update local state when URL search changes
  useEffect(() => {
    setSearchInputValue(search)
  }, [search])

  // Debounce the actual search API call
  useEffect(() => {
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
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchInputValue, search, searchParams, router, pathname])

  // Handle search input changes
  const handleSearchInputChange = useCallback((value: string) => {
    setSearchInputValue(value)
  }, [])

  // Handle filter changes (server-side)
  const handleBrandFilterChange = (value: number | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value !== null) {
      params.set("brand_id", value.toString())
    } else {
      params.delete("brand_id")
    }
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleCategoryFilterChange = (value: number | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value !== null) {
      params.set("category_id", value.toString())
    } else {
      params.delete("category_id")
    }
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleUnitFilterChange = (value: number | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value !== null) {
      params.set("unit_id", value.toString())
    } else {
      params.delete("unit_id")
    }
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleTaxFilterChange = (value: number | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value !== null) {
      params.set("tax_id", value.toString())
    } else {
      params.delete("tax_id")
    }
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleWarehouseFilterChange = (value: number | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value !== null) {
      params.set("warehouse_id", value.toString())
    } else {
      params.delete("warehouse_id")
    }
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleImeiVariantFilterChange = (value: "imei" | "variant" | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "imei") {
      params.set("is_imei", "true")
      params.delete("is_variant")
    } else if (value === "variant") {
      params.set("is_variant", "true")
      params.delete("is_imei")
    } else {
      params.delete("is_imei")
      params.delete("is_variant")
    }
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleStockFilterChange = (value: "with" | "without" | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("stock_filter", value)
    } else {
      params.delete("stock_filter")
    }
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleProductTypeFilterChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value !== null) {
      params.set("product_type", value.toString())
    } else {
      params.delete("product_type")
    }
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  // Handle status filter changes (client-side)
  const handleStatusFilterChange = (values: string[]) => {
    setStatusFilter(values)
  }

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: products,
    columns,
    state: {
      sorting,
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
      rowSelection,
      columnFilters: [],
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
    onRowSelectionChange: setRowSelection,
    onSortingChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(sorting) : updater
      setSorting(next)
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
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-destructive font-medium">Error loading products</p>
        <p className="text-muted-foreground text-sm text-center">
          {error instanceof Error
            ? error.message
            : "Unable to load products. Please try again."}
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
        searchPlaceholder="Filter products..."
        searchKey="name"
        searchValue={searchInputValue}
        onSearchChange={handleSearchInputChange}
        customFilters={
          <div className="flex flex-wrap items-center gap-2">
            <WarehouseCombobox
              value={warehouseId}
              onValueChange={handleWarehouseFilterChange}
              placeholder="Filter by warehouse..."
              className="h-8 w-[180px]"
            />
            <CategoryCombobox
              value={categoryId}
              onValueChange={handleCategoryFilterChange}
              placeholder="Filter by category..."
              className="h-8 w-[180px]"
            />
            <BrandCombobox
              value={brandId}
              onValueChange={handleBrandFilterChange}
              placeholder="Filter by brand..."
              className="h-8 w-[180px]"
            />
            <UnitCombobox
              value={unitId}
              onValueChange={handleUnitFilterChange}
              placeholder="Filter by unit..."
              className="h-8 w-[180px]"
            />
            <TaxCombobox
              value={taxId}
              onValueChange={handleTaxFilterChange}
              placeholder="Filter by tax..."
              className="h-8 w-[180px]"
            />
            <ImeiVariantCombobox
              value={imeiVariant}
              onValueChange={handleImeiVariantFilterChange}
              placeholder="Filter by IMEI/Variant..."
              className="h-8 w-[180px]"
            />
            <ProductTypeCombobox
              value={productType}
              onValueChange={handleProductTypeFilterChange}
              placeholder="Filter by type..."
              className="h-8 w-[180px]"
            />
            <StockFilterCombobox
              value={stockFilter as "with" | "without" | null}
              onValueChange={handleStockFilterChange}
              placeholder="Filter by stock..."
              className="h-8 w-[180px]"
            />
          </div>
        }
        filters={[
          {
            columnId: "is_active",
            title: "Status",
            options: productStatuses.map((status) => ({
              label: status.label,
              value: status.value,
              count: rawProducts.filter((product) => {
                const productStatus = product.is_active ? "active" : "inactive"
                return productStatus === status.value
              }).length,
            })),
            value: statusFilter,
            onChange: handleStatusFilterChange,
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

