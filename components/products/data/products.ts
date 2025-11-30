/**
 * Product API Functions
 *
 * All API calls for products are defined here.
 * Uses server-side pagination, search, and sorting.
 * Uses client-side API for browser components.
 */

import {
  apiGetClient,
  apiPostClient,
  apiPutClient,
  apiDeleteClient,
} from "@/lib/api-client-client"
import { productSchema, productListSchema, type Product } from "./schema"

export type ProductFilters = {
  search?: string
  product_type?: "all" | "standard" | "combo" | "digital" | "service"
  brand_id?: number | null
  category_id?: number | null
  unit_id?: number | null
  tax_id?: number | null
  is_variant?: boolean | null
  is_imei?: boolean | null
  stock_filter?: "all" | "in_stock" | "out_of_stock" | "low_stock"
  per_page?: number
  sort_by?: string
  sort_dir?: "asc" | "desc"
  page?: number
}

type ProductListResponse = {
  data: Product[]
  meta?: {
    current_page: number
    per_page: number
    total: number
    last_page: number
    from: number
    to: number
  }
}

type ProductDropdownItem = {
  id: number
  name: string
  code: string
  price: number
  qty?: number | null
}

/**
 * Get all products with server-side pagination, search, and sorting
 */
export async function getProducts(
  filters: ProductFilters = {}
): Promise<ProductListResponse> {
  const params: Record<string, string | number | boolean> = {}

  if (filters.search) {
    params.search = filters.search
  }

  if (filters.product_type && filters.product_type !== "all") {
    params.product_type = filters.product_type
  }

  if (filters.brand_id !== undefined && filters.brand_id !== null) {
    params.brand_id = filters.brand_id
  }

  if (filters.category_id !== undefined && filters.category_id !== null) {
    params.category_id = filters.category_id
  }

  if (filters.unit_id !== undefined && filters.unit_id !== null) {
    params.unit_id = filters.unit_id
  }

  if (filters.tax_id !== undefined && filters.tax_id !== null) {
    params.tax_id = filters.tax_id
  }

  if (filters.is_variant !== undefined && filters.is_variant !== null) {
    params.is_variant = filters.is_variant
  }

  if (filters.is_imei !== undefined && filters.is_imei !== null) {
    params.is_imei = filters.is_imei
  }

  if (filters.stock_filter && filters.stock_filter !== "all") {
    params.stock_filter = filters.stock_filter
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

  const response = await apiGetClient<Product[]>("products", params)

  return {
    data: productListSchema.parse(response.data),
    meta: response.meta,
  }
}

/**
 * Get product dropdown list
 */
export async function getProductDropdown(
  warehouseId?: number
): Promise<ProductDropdownItem[]> {
  const params: Record<string, number> = {}
  if (warehouseId) {
    params.warehouse_id = warehouseId
  }

  const response = await apiGetClient<ProductDropdownItem[]>(
    "products/dropdown",
    params
  )
  return response.data
}

/**
 * Get a single product by ID
 */
export async function getProduct(id: number): Promise<Product> {
  const response = await apiGetClient<Product>(`products/${id}`)
  return productSchema.parse(response.data)
}

/**
 * Create a new product
 */
export async function createProduct(
  data: FormData | {
    name: string
    code?: string | null
    type: "standard" | "combo" | "digital" | "service"
    category_id: number
    unit_id: number
    purchase_unit_id?: number | null
    sale_unit_id?: number | null
    cost: number
    price: number
    wholesale_price?: number | null
    brand_id?: number | null
    tax_id?: number | null
    tax_method?: number | null
    alert_quantity?: number | null
    image?: File | null
    file?: File | null
    is_variant?: boolean | null
    is_batch?: boolean | null
    is_imei?: boolean | null
    product_details?: string | null
    slug?: string | null
  }
): Promise<{ data: Product; message: string }> {
  let body: FormData | Record<string, unknown>

  if (data instanceof FormData) {
    body = data
  } else {
    body = new FormData()
    body.append("name", data.name)

    if (data.code) {
      body.append("code", data.code)
    }

    body.append("type", data.type)
    body.append("category_id", String(data.category_id))
    body.append("unit_id", String(data.unit_id))

    if (data.purchase_unit_id !== undefined && data.purchase_unit_id !== null) {
      body.append("purchase_unit_id", String(data.purchase_unit_id))
    }

    if (data.sale_unit_id !== undefined && data.sale_unit_id !== null) {
      body.append("sale_unit_id", String(data.sale_unit_id))
    }

    body.append("cost", String(data.cost))
    body.append("price", String(data.price))

    if (data.wholesale_price !== undefined && data.wholesale_price !== null) {
      body.append("wholesale_price", String(data.wholesale_price))
    }

    if (data.brand_id !== undefined && data.brand_id !== null) {
      body.append("brand_id", String(data.brand_id))
    }

    if (data.tax_id !== undefined && data.tax_id !== null) {
      body.append("tax_id", String(data.tax_id))
    }

    if (data.tax_method !== undefined && data.tax_method !== null) {
      body.append("tax_method", String(data.tax_method))
    }

    if (data.alert_quantity !== undefined && data.alert_quantity !== null) {
      body.append("alert_quantity", String(data.alert_quantity))
    }

    if (data.image) {
      body.append("image", data.image)
    }

    if (data.file) {
      body.append("file", data.file)
    }

    if (data.is_variant !== undefined && data.is_variant !== null) {
      body.append("is_variant", data.is_variant ? "1" : "0")
    }

    if (data.is_batch !== undefined && data.is_batch !== null) {
      body.append("is_batch", data.is_batch ? "1" : "0")
    }

    if (data.is_imei !== undefined && data.is_imei !== null) {
      body.append("is_imei", data.is_imei ? "1" : "0")
    }

    if (data.product_details) {
      body.append("product_details", data.product_details)
    }

    if (data.slug) {
      body.append("slug", data.slug)
    }
  }

  const response = await apiPostClient<Product>("products", body)
  return {
    data: productSchema.parse(response.data),
    message: response.message,
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(
  id: number,
  data: FormData | {
    name: string
    code?: string | null
    type: "standard" | "combo" | "digital" | "service"
    category_id: number
    unit_id: number
    purchase_unit_id?: number | null
    sale_unit_id?: number | null
    cost: number
    price: number
    wholesale_price?: number | null
    brand_id?: number | null
    tax_id?: number | null
    tax_method?: number | null
    alert_quantity?: number | null
    image?: File | null
    file?: File | null
    is_variant?: boolean | null
    is_batch?: boolean | null
    is_imei?: boolean | null
    product_details?: string | null
    slug?: string | null
  }
): Promise<{ data: Product; message: string }> {
  let body: FormData | Record<string, unknown>

  if (data instanceof FormData) {
    body = data
    body.append("_method", "PUT")
  } else {
    body = new FormData()
    body.append("name", data.name)
    body.append("_method", "PUT")

    if (data.code) {
      body.append("code", data.code)
    }

    body.append("type", data.type)
    body.append("category_id", String(data.category_id))
    body.append("unit_id", String(data.unit_id))

    if (data.purchase_unit_id !== undefined && data.purchase_unit_id !== null) {
      body.append("purchase_unit_id", String(data.purchase_unit_id))
    }

    if (data.sale_unit_id !== undefined && data.sale_unit_id !== null) {
      body.append("sale_unit_id", String(data.sale_unit_id))
    }

    body.append("cost", String(data.cost))
    body.append("price", String(data.price))

    if (data.wholesale_price !== undefined && data.wholesale_price !== null) {
      body.append("wholesale_price", String(data.wholesale_price))
    }

    if (data.brand_id !== undefined && data.brand_id !== null) {
      body.append("brand_id", String(data.brand_id))
    }

    if (data.tax_id !== undefined && data.tax_id !== null) {
      body.append("tax_id", String(data.tax_id))
    }

    if (data.tax_method !== undefined && data.tax_method !== null) {
      body.append("tax_method", String(data.tax_method))
    }

    if (data.alert_quantity !== undefined && data.alert_quantity !== null) {
      body.append("alert_quantity", String(data.alert_quantity))
    }

    if (data.image) {
      body.append("image", data.image)
    }

    if (data.file) {
      body.append("file", data.file)
    }

    if (data.is_variant !== undefined && data.is_variant !== null) {
      body.append("is_variant", data.is_variant ? "1" : "0")
    }

    if (data.is_batch !== undefined && data.is_batch !== null) {
      body.append("is_batch", data.is_batch ? "1" : "0")
    }

    if (data.is_imei !== undefined && data.is_imei !== null) {
      body.append("is_imei", data.is_imei ? "1" : "0")
    }

    if (data.product_details) {
      body.append("product_details", data.product_details)
    }

    if (data.slug) {
      body.append("slug", data.slug)
    }
  }

  const response = await apiPutClient<Product>(`products/${id}`, body)
  return {
    data: productSchema.parse(response.data),
    message: response.message,
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(id: number): Promise<void> {
  await apiDeleteClient(`products/${id}`)
}

/**
 * Bulk delete products
 */
export async function bulkDeleteProducts(ids: number[]): Promise<void> {
  await apiPostClient("products/bulk-delete", { ids })
}

/**
 * Import products from CSV
 */
export async function importProducts(file: File): Promise<{
  imported: number
  errors: unknown[]
}> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await apiPostClient<{
    imported: number
    errors: unknown[]
  }>("products/import", formData)

  return response.data
}

