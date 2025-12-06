/**
 * Product API Functions
 *
 * All API calls for products are defined here.
 * Uses server-side pagination, search, and sorting.
 * Uses client-side API for browser components.
 */

import { apiGetClient, apiPostClient, apiPutClient, apiDeleteClient } from "@/lib/api-client-client"
import {
  productSchema,
  productListSchema,
  type Product,
  type BarcodeSetting,
  barcodeSettingSchema,
  barcodeSettingsListSchema,
  type BarcodeSettingsList,
} from "./schema"
import { downloadExcel, downloadPDF } from "@/lib/export-utils"

export type ProductFilters = {
  search?: string
  product_type?: "standard" | "combo" | "digital" | "service"
  brand_id?: number | null
  category_id?: number | null
  unit_id?: number | null
  tax_id?: number | null
  warehouse_id?: number | null
  is_variant?: boolean | null
  is_imei?: boolean | null
  stock_filter?: "with" | "without"
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
export async function getProducts(filters: ProductFilters = {}): Promise<ProductListResponse> {
  const params: Record<string, string | number | boolean> = {}

  if (filters.search) {
    params.search = filters.search
  }

  if (filters.product_type) {
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

  if (filters.warehouse_id !== undefined && filters.warehouse_id !== null) {
    params.warehouse_id = filters.warehouse_id
  }

  if (filters.is_variant !== undefined && filters.is_variant !== null) {
    params.is_variant = filters.is_variant ? "1" : "0"
  }

  if (filters.is_imei !== undefined && filters.is_imei !== null) {
    params.is_imei = filters.is_imei ? "1" : "0"
  }

  if (filters.stock_filter) {
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
export async function getProductDropdown(warehouseId?: number): Promise<ProductDropdownItem[]> {
  const params: Record<string, number> = {}
  if (warehouseId) {
    params.warehouse_id = warehouseId
  }

  const response = await apiGetClient<ProductDropdownItem[]>("products/dropdown", params)
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
  data:
    | FormData
    | {
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
      },
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
  data:
    | FormData
    | {
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
      },
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

/**
 * Generate a unique product code
 */
export async function generateProductCode(): Promise<string> {
  const response = await apiGetClient<{ code: string }>("products/generate-code")
  return response.data.code
}

type ProductWithoutVariant = {
  id: number
  name: string
  code: string
}

type ProductWithVariant = {
  id: number
  name: string
  item_code: string
  qty: number
}

export type ComboProductSearchResult = {
  name: string
  code: string
  variant_id: number | null
  additional_price: number
  price: number
  qty: number
  id: number
  cost: number
  brand: string
  unit_id: number
  image?: string
  units: Array<{
    id: number
    name: string
    operation_value: number
    operator: string
    selected: boolean
  }>
}

type SaleUnitItem = {
  name: string
  operator: string
  operation_value: number
}

export type SaleUnit = {
  [key: number]: SaleUnitItem | string
}

/**
 * Get products without variants for combo products
 */
export async function getProductsWithoutVariant(): Promise<ProductWithoutVariant[]> {
  const response = await apiGetClient<ProductWithoutVariant[]>("products/without-variant")
  return response.data
}

/**
 * Get products with variants for combo products
 */
export async function getProductsWithVariant(): Promise<ProductWithVariant[]> {
  const response = await apiGetClient<ProductWithVariant[]>("products/with-variant")
  return response.data
}

/**
 * Search product by code for combo products
 */
export async function searchProductForCombo(data: string, warehouseId?: number): Promise<ComboProductSearchResult[]> {
  const params: Record<string, string | number> = { data }
  if (warehouseId) {
    params.warehouse_id = warehouseId
  }
  const response = await apiGetClient<ComboProductSearchResult[]>("products/search-combo", params)
  return response.data
}

/**
 * Get sale and purchase units for a base unit
 */
export async function getSaleUnits(unitId: number): Promise<SaleUnit> {
  const response = await apiGetClient<SaleUnit>(`products/sale-unit/${unitId}`)
  return response.data
}

/**
 * Product History Types
 */
export type ProductHistoryFilters = {
  starting_date: string
  ending_date: string
  warehouse_id?: number | null
  search?: string
  page?: number
  per_page?: number
}

export type HistoryItem = {
  id: number
  reference_no: string
  created_at: string
  customer_name?: string
  customer_phone?: string
  supplier_name?: string
  supplier_phone?: string
  warehouse_name: string
  qty: number
  sale_unit_id?: number
  purchase_unit_id?: number
  total: number
}

export type HistoryResponse = {
  data: HistoryItem[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
    from: number
    to: number
  }
}

/**
 * Get sale history for a product
 */
export async function getProductSaleHistory(
  productId: number,
  filters: ProductHistoryFilters,
): Promise<HistoryResponse> {
  const response = await apiGetClient<HistoryResponse>(`products/${productId}/history/sales`, filters)
  return response.data
}

/**
 * Get purchase history for a product
 */
export async function getProductPurchaseHistory(
  productId: number,
  filters: ProductHistoryFilters,
): Promise<HistoryResponse> {
  const response = await apiGetClient<HistoryResponse>(`products/${productId}/history/purchases`, filters)
  return response.data
}

/**
 * Get sale return history for a product
 */
export async function getProductSaleReturnHistory(
  productId: number,
  filters: ProductHistoryFilters,
): Promise<HistoryResponse> {
  const response = await apiGetClient<HistoryResponse>(`products/${productId}/history/sale-returns`, filters)
  return response.data
}

/**
 * Get purchase return history for a product
 */
export async function getProductPurchaseReturnHistory(
  productId: number,
  filters: ProductHistoryFilters,
): Promise<HistoryResponse> {
  const response = await apiGetClient<HistoryResponse>(`products/${productId}/history/purchase-returns`, filters)
  return response.data
}

/**
 * Export products
 */
export async function exportProducts(data: {
  columns: string[]
  export_type: string
  export_method: string
  emails?: string[]
  schedule_at?: string | null
  filters?: Record<string, any>
}): Promise<any> {
  if (data.export_method === "download") {
    // Generate file in browser
    const products = await getProducts(data.filters || {})

    // Map column IDs to labels
    const columnMap: Record<string, string> = {
      name: "Name",
      code: "Code",
      barcode: "Barcode",
      category: "Category",
      brand: "Brand",
      unit: "Unit",
      cost: "Cost",
      price: "Price",
      quantity: "Quantity",
      alert_quantity: "Alert Quantity",
      tax: "Tax",
      tax_method: "Tax Method",
      status: "Status",
      created_at: "Created At",
    }

    const columns = data.columns.map((id) => ({ id, label: columnMap[id] || id }))
    const filename = `products_${new Date().getTime()}.${data.export_type === "excel" ? "xlsx" : "pdf"}`

    if (data.export_type === "excel") {
      downloadExcel(products.data, columns, filename)
    } else {
      downloadPDF(products.data, columns, filename, "Products Export")
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

  return await apiPostClient("products/export", requestData)
}

/**
 * Export product history
 */
export async function exportProductHistory(
  productId: number,
  data: {
    columns: string[]
    export_type: string
    export_method: string
    emails?: string[]
    schedule_at?: string | null
    history_type: string
    filters: ProductHistoryFilters
  },
): Promise<any> {
  if (data.export_method === "download") {
    // Generate file in browser
    let historyData: HistoryResponse

    switch (data.history_type) {
      case "purchases":
        historyData = await getProductPurchaseHistory(productId, data.filters)
        break
      case "sale-returns":
        historyData = await getProductSaleReturnHistory(productId, data.filters)
        break
      case "purchase-returns":
        historyData = await getProductPurchaseReturnHistory(productId, data.filters)
        break
      default:
        historyData = await getProductSaleHistory(productId, data.filters)
    }

    // Map column IDs to labels
    const columnMap: Record<string, string> = {
      reference_no: "Reference No",
      created_at: "Date",
      customer_name: "Customer",
      customer_phone: "Phone",
      supplier_name: "Supplier",
      supplier_phone: "Phone",
      warehouse_name: "Warehouse",
      qty: "Quantity",
      total: "Total",
    }

    const columns = data.columns.map((id) => ({ id, label: columnMap[id] || id }))
    const filename = `product_history_${data.history_type}_${new Date().getTime()}.${data.export_type === "excel" ? "xlsx" : "pdf"}`

    if (data.export_type === "excel") {
      downloadExcel(historyData.data, columns, filename)
    } else {
      downloadPDF(historyData.data, columns, filename, `Product History - ${data.history_type}`)
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
    history_type: data.history_type,
    starting_date: data.filters.starting_date,
    ending_date: data.filters.ending_date,
    warehouse_id: data.filters.warehouse_id,
    search: data.filters.search,
  }

  return await apiPostClient(`products/${productId}/history/export`, requestData)
}

/**
 * Get all barcode settings for dropdown/combobox
 * This is the function likely required by BarcodeSettingsCombobox
 */
export async function getBarcodeSettingsList(): Promise<BarcodeSettingsList> {
  const response = await apiGetClient<BarcodeSettingsList>("barcodes")
  return barcodeSettingsListSchema.parse(response.data)
}

/**
 * Get a single barcode setting by ID
 */
export async function getBarcodeSetting(id: number): Promise<BarcodeSetting> {
  const response = await apiGetClient<BarcodeSetting>(`barcodes/${id}`)
  return barcodeSettingSchema.parse(response.data)
}
