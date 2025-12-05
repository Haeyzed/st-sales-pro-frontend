/**
 * Brand API Functions
 *
 * All API calls for brands are defined here.
 * Uses server-side pagination, search, and sorting.
 * Uses client-side API for browser components.
 */

import {
  apiGetClient,
  apiPostClient,
  apiPutClient,
  apiDeleteClient,
} from "@/lib/api-client-client"
import { brandSchema, brandListSchema, type Brand } from "./schema"
import { downloadExcel, downloadPDF } from "@/lib/export-utils"

export type BrandFilters = {
  search?: string
  per_page?: number
  sort_by?: string
  sort_dir?: "asc" | "desc"
  page?: number
}

type BrandListResponse = {
  data: Brand[]
  meta?: {
    current_page: number
    per_page: number
    total: number
    last_page: number
    from: number
    to: number
  }
}

type BrandDropdownItem = {
  id: number
  title: string
}

/**
 * Get all brands with server-side pagination, search, and sorting
 */
export async function getBrands(
  filters: BrandFilters = {}
): Promise<BrandListResponse> {
  const params: Record<string, string | number> = {}

  if (filters.search) {
    params.search = filters.search
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

  const response = await apiGetClient<Brand[]>("brands", params)

  return {
    data: brandListSchema.parse(response.data),
    meta: response.meta,
  }
}

/**
 * Get brand dropdown list
 */
export async function getBrandDropdown(): Promise<BrandDropdownItem[]> {
  const response = await apiGetClient<BrandDropdownItem[]>("brands/dropdown")
  return response.data
}

/**
 * Get a single brand by ID
 */
export async function getBrand(id: number): Promise<Brand> {
  const response = await apiGetClient<Brand>(`brands/${id}`)
  return brandSchema.parse(response.data)
}

/**
 * Create a new brand
 */
export async function createBrand(
  data: FormData | {
    title: string
    image?: File[]
    is_active?: boolean
  }
): Promise<{ data: Brand; message: string }> {
  let body: FormData | Record<string, unknown>

  if (data instanceof FormData) {
    body = data
  } else {
    body = new FormData()
    body.append("title", data.title)

    if (data.image && data.image.length > 0) {
      body.append("image", data.image[0])
    }
    
    if (data.is_active !== undefined) {
      body.append("is_active", data.is_active ? "1" : "0")
    }
  }

  const response = await apiPostClient<Brand>("brands", body)
  return {
    data: brandSchema.parse(response.data),
    message: response.message,
  }
}

/**
 * Update an existing brand
 */
export async function updateBrand(
  id: number,
  data: FormData | {
    title: string
    image?: File[]
    is_active?: boolean
  }
): Promise<{ data: Brand; message: string }> {
  let body: FormData | Record<string, unknown>

  if (data instanceof FormData) {
    body = data
  } else {
    body = new FormData()
    body.append("title", data.title)
    body.append("_method", "PUT")

    if (data.image && data.image.length > 0) {
      body.append("image", data.image[0])
    }

    if (data.is_active !== undefined) {
      body.append("is_active", data.is_active ? "1" : "0")
    }
  }

  const response = await apiPutClient<Brand>(`brands/${id}`, body)
  return {
    data: brandSchema.parse(response.data),
    message: response.message,
  }
}

/**
 * Delete a brand
 */
export async function deleteBrand(id: number): Promise<void> {
  await apiDeleteClient(`brands/${id}`)
}

/**
 * Bulk delete brands
 */
export async function bulkDeleteBrands(ids: number[]): Promise<void> {
  await apiPostClient("brands/bulk-delete", { ids })
}

/**
 * Import brands from CSV
 */
export async function importBrands(file: File): Promise<{
  imported: number
  errors: unknown[]
}> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await apiPostClient<{
    imported: number
    errors: unknown[]
  }>("brands/import", formData)

  return response.data
}

/**
 * Export brands
 */
export async function exportBrands(data: {
  columns: string[]
  export_type: string
  export_method: string
  emails?: string[]
  schedule_at?: string | null
  filters?: Record<string, any>
}): Promise<any> {
  if (data.export_method === "download") {
    // Generate file in browser
    const brands = await getBrands(data.filters || {})
    
    // Map column IDs to labels
    const columnMap: Record<string, string> = {
      title: 'Brand Title',
      image: 'Image',
      created_at: 'Created At',
    }
    
    const columns = data.columns.map(id => ({ id, label: columnMap[id] || id }))
    const filename = `brands_${new Date().getTime()}.${data.export_type === "excel" ? "xlsx" : "pdf"}`
    
    if (data.export_type === "excel") {
      downloadExcel(brands.data, columns, filename)
    } else {
      downloadPDF(brands.data, columns, filename, 'Brands Export')
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
  
  return await apiPostClient("brands/export", requestData)
}

