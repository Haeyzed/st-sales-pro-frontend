"use client"

import { useMemo, useState } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import type {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
} from "@tanstack/react-table"

type UseTableStateParams = {
  pagination?: {
    defaultPage?: number
    defaultPageSize?: number
  }
}

type UseTableStateReturn = {
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
}

export function useTableState(
  params: UseTableStateParams = {}
): UseTableStateReturn {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const defaultPage = params.pagination?.defaultPage ?? 1
  const defaultPageSize = params.pagination?.defaultPageSize ?? 10

  const pagination: PaginationState = useMemo(() => {
    const page = searchParams.get("page")
    const pageSize = searchParams.get("pageSize")
    const pageNum = page ? parseInt(page, 10) : defaultPage
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : defaultPageSize
    return {
      pageIndex: Math.max(0, pageNum - 1),
      pageSize: pageSizeNum,
    }
  }, [searchParams, defaultPage, defaultPageSize])

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === "function" ? updater(pagination) : updater
    const nextPage = next.pageIndex + 1
    const nextPageSize = next.pageSize

    const params = new URLSearchParams(searchParams.toString())
    if (nextPage > defaultPage) {
      params.set("page", nextPage.toString())
    } else {
      params.delete("page")
    }
    if (nextPageSize !== defaultPageSize) {
      params.set("pageSize", nextPageSize.toString())
    } else {
      params.delete("pageSize")
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (updater) => {
    const next =
      typeof updater === "function" ? updater(columnFilters) : updater
    setColumnFilters(next)

    // Reset to first page when filters change
    const params = new URLSearchParams(searchParams.toString())
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  return {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
  }
}

