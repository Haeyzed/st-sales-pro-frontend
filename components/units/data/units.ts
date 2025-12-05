/**
 * Unit API Functions
 *
 * All API calls for units are defined here.
 * Uses server-side pagination, search, and sorting.
 * Uses client-side API for browser components.
 */

import { apiGetClient, apiPostClient, apiPutClient, apiDeleteClient } from "@/lib/api-client-client"
import { unitSchema, unitListSchema, type Unit } from "./schema"
import { downloadExcel, downloadPDF } from "@/lib/export-utils"

export type UnitFilters = {
  search?: string
  is_active?: boolean
  per_page?: number
  sort_by?: string
  sort_dir?: "asc" | "desc"
  page?: number
}

type UnitListResponse = {
  data: Unit[]
  meta?: {
    current_page: number
    per_page: number
    total: number
    last_page: number
    from: number
    to: number
  }
}

type UnitDropdownItem = {
  id: number
  name: string
  code: string
}

/**
 * Get all units with server-side pagination, search, and sorting
 */
export async function getUnits(filters: UnitFilters = {}): Promise<UnitListResponse> {
  const params: Record<string, string | number | boolean> = {}

  if (filters.search) {
    params.search = filters.search
  }

  if (filters.is_active !== undefined) {
    params.is_active = filters.is_active
  }

  if (filters.per_page) {
    params.per_page = filters.per_page
  }

  if (filters.sort_by) {
    params.sort_by = filters.sort_by
  }

  if (filters.sort_dir) {
    params.sort_dir = filters.sort_dir
  }

  if (filters.page) {
    params.page = filters.page
  }

  const response = await apiGetClient<Unit[]>("units", params)

  return {
    data: unitListSchema.parse(response.data),
    meta: response.meta,
  }
}

/**
 * Get unit dropdown list
 */
export async function getUnitDropdown(): Promise<UnitDropdownItem[]> {
  const response = await apiGetClient<UnitDropdownItem[]>("units/dropdown")
  return response.data
}

/**
 * Get base units only (units that can be used as base units)
 */
export async function getBaseUnits(): Promise<UnitDropdownItem[]> {
  const response = await apiGetClient<UnitDropdownItem[]>("units/base")
  return response.data
}

/**
 * Get a single unit by ID
 */
export async function getUnit(id: number): Promise<Unit> {
  const response = await apiGetClient<Unit>(`units/${id}`)
  return unitSchema.parse(response.data)
}

/**
 * Create a new unit
 */
export async function createUnit(
  data:
    | FormData
    | {
        unit_code: string
        unit_name: string
        base_unit?: number | null
        operator?: string | null
        operation_value?: number | null
        is_active?: boolean
      },
): Promise<{ data: Unit; message: string }> {
  let body: FormData | Record<string, unknown>

  if (data instanceof FormData) {
    body = data
  } else {
    body = new FormData()
    body.append("unit_code", data.unit_code)
    body.append("unit_name", data.unit_name)

    if (data.base_unit !== undefined && data.base_unit !== null) {
      body.append("base_unit", String(data.base_unit))
    }

    if (data.operator) {
      body.append("operator", data.operator)
    }

    if (data.operation_value !== undefined && data.operation_value !== null) {
      body.append("operation_value", String(data.operation_value))
    }

    if (data.is_active !== undefined) {
      body.append("is_active", data.is_active ? "1" : "0")
    }
  }

  const response = await apiPostClient<Unit>("units", body)
  return {
    data: unitSchema.parse(response.data),
    message: response.message,
  }
}

/**
 * Update an existing unit
 */
export async function updateUnit(
  id: number,
  data:
    | FormData
    | {
        unit_code: string
        unit_name: string
        base_unit?: number | null
        operator?: string | null
        operation_value?: number | null
        is_active?: boolean
      },
): Promise<{ data: Unit; message: string }> {
  let body: FormData | Record<string, unknown>

  if (data instanceof FormData) {
    body = data
  } else {
    body = new FormData()
    body.append("unit_code", data.unit_code)
    body.append("unit_name", data.unit_name)
    body.append("_method", "PUT")

    if (data.base_unit !== undefined && data.base_unit !== null) {
      body.append("base_unit", String(data.base_unit))
    }

    if (data.operator) {
      body.append("operator", data.operator)
    }

    if (data.operation_value !== undefined && data.operation_value !== null) {
      body.append("operation_value", String(data.operation_value))
    }

    if (data.is_active !== undefined) {
      body.append("is_active", data.is_active ? "1" : "0")
    }
  }

  const response = await apiPutClient<Unit>(`units/${id}`, body)
  return {
    data: unitSchema.parse(response.data),
    message: response.message,
  }
}

/**
 * Delete a unit
 */
export async function deleteUnit(id: number): Promise<void> {
  await apiDeleteClient(`units/${id}`)
}

/**
 * Bulk delete units
 */
export async function bulkDeleteUnits(ids: number[]): Promise<void> {
  await apiPostClient("units/bulk-delete", { ids })
}

/**
 * Import units from CSV
 */
export async function importUnits(file: File): Promise<{
  imported: number
  errors: unknown[]
}> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await apiPostClient<{
    imported: number
    errors: unknown[]
  }>("units/import", formData)

  return response.data
}

/**
 * Export units
 */
export async function exportUnits(data: {
  columns: string[]
  export_type: string
  export_method: string
  emails?: string[]
  schedule_at?: string | null
  filters?: Record<string, any>
}): Promise<any> {
  if (data.export_method === "download") {
    // Generate file in browser
    const units = await getUnits(data.filters || {})

    // Map column IDs to labels
    const columnMap: Record<string, string> = {
      unit_code: "Unit Code",
      unit_name: "Unit Name",
      base_unit: "Base Unit",
      operator: "Operator",
      operation_value: "Operation Value",
      is_active: "Active",
      created_at: "Created At",
    }

    const columns = data.columns.map((id) => ({ id, label: columnMap[id] || id }))
    const filename = `units_${new Date().getTime()}.${data.export_type === "excel" ? "xlsx" : "pdf"}`

    if (data.export_type === "excel") {
      downloadExcel(units.data, columns, filename)
    } else {
      downloadPDF(units.data, columns, filename, "Units Export")
    }

    return { success: true }
  }

  // For email, use backend
  const requestData = {
    columns: data.columns,
    export_type: data.export_type,
    export_method: data.export_method,
    emails: data.emails,
    schedule_at: data.schedule_at,
    ...data.filters,
  }

  return await apiPostClient("units/export", requestData)
}
