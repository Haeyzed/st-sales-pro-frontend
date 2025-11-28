/**
 * Category API Functions
 *
 * All API calls for categories are defined here.
 * Uses server-side pagination, search, and sorting.
 * Uses client-side API for browser components.
 */

import {
  apiGetClient,
  apiPostClient,
  apiPutClient,
  apiDeleteClient,
} from "@/lib/api-client-client"
import { categorySchema, categoryListSchema, type Category } from "./schema"

export type CategoryFilters = {
  search?: string
  parent_id?: number | null
  per_page?: number
  sort_by?: string
  sort_dir?: "asc" | "desc"
  page?: number
}

type CategoryListResponse = {
  data: Category[]
  meta?: {
    current_page: number
    per_page: number
    total: number
    last_page: number
    from: number
    to: number
  }
}

type CategoryDropdownItem = {
  id: number
  name: string
  parent_id?: number | null
}

/**
 * Get all categories with server-side pagination, search, and sorting
 */
export async function getCategories(
  filters: CategoryFilters = {}
): Promise<CategoryListResponse> {
  const params: Record<string, string | number> = {}

  if (filters.search) {
    params.search = filters.search
  }

  if (filters.parent_id !== undefined && filters.parent_id !== null) {
    params.parent_id = filters.parent_id
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

  const response = await apiGetClient<Category[]>("categories", params)

  return {
    data: categoryListSchema.parse(response.data),
    meta: response.meta,
  }
}

/**
 * Get category tree (hierarchical structure)
 */
export async function getCategoryTree(): Promise<Category[]> {
  const response = await apiGetClient<Category[]>("categories/tree")
  return categoryListSchema.parse(response.data)
}

/**
 * Get category dropdown list
 */
export async function getCategoryDropdown(): Promise<CategoryDropdownItem[]> {
  const response = await apiGetClient<CategoryDropdownItem[]>("categories/dropdown")
  return response.data
}

/**
 * Get a single category by ID
 */
export async function getCategory(id: number): Promise<Category> {
  const response = await apiGetClient<Category>(`categories/${id}`)
  return categorySchema.parse(response.data)
}

/**
 * Get category statistics
 */
export async function getCategoryStats(id: number): Promise<unknown> {
  const response = await apiGetClient<unknown>(`categories/${id}/stats`)
  return response.data
}

/**
 * Create a new category
 */
export async function createCategory(
  data: FormData | {
    name: string
    parent_id?: number | null
    image?: File | null
    icon?: File | null
    slug?: string | null
    featured?: boolean | null
    page_title?: string | null
    short_description?: string | null
    is_sync_disable?: boolean | null
  }
): Promise<Category> {
  let body: FormData | Record<string, unknown>

  if (data instanceof FormData) {
    body = data
  } else {
    body = new FormData()
    body.append("name", data.name)

    if (data.parent_id !== undefined && data.parent_id !== null) {
      body.append("parent_id", String(data.parent_id))
    }

    if (data.image) {
      body.append("image", data.image)
    }

    if (data.icon) {
      body.append("icon", data.icon)
    }

    if (data.slug) {
      body.append("slug", data.slug)
    }

    if (data.featured !== undefined && data.featured !== null) {
      body.append("featured", String(data.featured))
    }

    if (data.page_title) {
      body.append("page_title", data.page_title)
    }

    if (data.short_description) {
      body.append("short_description", data.short_description)
    }

    if (data.is_sync_disable !== undefined && data.is_sync_disable !== null) {
      body.append("is_sync_disable", String(data.is_sync_disable))
    }
  }

  const response = await apiPostClient<Category>("categories", body)
  return categorySchema.parse(response.data)
}

/**
 * Update an existing category
 */
export async function updateCategory(
  id: number,
  data: FormData | {
    name: string
    parent_id?: number | null
    image?: File | null
    icon?: File | null
    slug?: string | null
    featured?: boolean | null
    page_title?: string | null
    short_description?: string | null
    is_sync_disable?: boolean | null
  }
): Promise<Category> {
  let body: FormData | Record<string, unknown>

  if (data instanceof FormData) {
    body = data
  } else {
    body = new FormData()
    body.append("name", data.name)
    body.append("_method", "PUT")

    if (data.parent_id !== undefined && data.parent_id !== null) {
      body.append("parent_id", String(data.parent_id))
    }

    if (data.image) {
      body.append("image", data.image)
    }

    if (data.icon) {
      body.append("icon", data.icon)
    }

    if (data.slug) {
      body.append("slug", data.slug)
    }

    if (data.featured !== undefined && data.featured !== null) {
      body.append("featured", String(data.featured))
    }

    if (data.page_title) {
      body.append("page_title", data.page_title)
    }

    if (data.short_description) {
      body.append("short_description", data.short_description)
    }

    if (data.is_sync_disable !== undefined && data.is_sync_disable !== null) {
      body.append("is_sync_disable", String(data.is_sync_disable))
    }
  }

  const response = await apiPutClient<Category>(`categories/${id}`, body)
  return categorySchema.parse(response.data)
}

/**
 * Delete a category
 */
export async function deleteCategory(id: number): Promise<void> {
  await apiDeleteClient(`categories/${id}`)
}

/**
 * Bulk delete categories
 */
export async function bulkDeleteCategories(ids: number[]): Promise<void> {
  await apiPostClient("categories/bulk-delete", { ids })
}

/**
 * Import categories from CSV
 */
export async function importCategories(file: File): Promise<{
  imported: number
  errors: unknown[]
}> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await apiPostClient<{
    imported: number
    errors: unknown[]
  }>("categories/import", formData)

  return response.data
}

