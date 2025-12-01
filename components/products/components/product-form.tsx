"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CategoryCombobox } from "./category-combobox"
import { BrandCombobox } from "./brand-combobox"
import { UnitCombobox } from "./unit-combobox"
import { TaxCombobox } from "./tax-combobox"
import { ProductTypeCombobox } from "./product-type-combobox"
import { BarcodeSymbologyCombobox } from "./barcode-symbology-combobox"
import { TaxMethodCombobox } from "./tax-method-combobox"
import { WarrantyTypeCombobox } from "./warranty-type-combobox"
import { GuaranteeTypeCombobox } from "./guarantee-type-combobox"
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"
import { 
  createProduct, 
  updateProduct, 
  getProduct, 
  generateProductCode,
  getProductsWithoutVariant,
  getProductsWithVariant,
  searchProductForCombo,
  getSaleUnits
} from "../data/products"
import { apiGetClient } from "@/lib/api-client-client"
import { ProductSearchCombobox } from "./product-search-combobox"
import { Plus, X, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { type Product } from "../data/schema"

// Extended schema for full-page form
const formSchema = z.object({
  name: z.string().min(1, "Name is required."),
  code: z.string().nullable().optional(),
  type: z.enum(["standard", "combo", "digital", "service"]),
  barcode_symbology: z.string().optional(),
  category_id: z.number().min(1, "Category is required."),
  unit_id: z.number().min(1, "Unit is required."),
  purchase_unit_id: z.number().nullable().optional(),
  sale_unit_id: z.number().nullable().optional(),
  cost: z.number().min(0, "Cost must be greater than or equal to 0."),
  price: z.number().min(0, "Price must be greater than or equal to 0."),
  profit_margin: z.number().nullable().optional(),
  wholesale_price: z.number().nullable().optional(),
  daily_sale_objective: z.number().nullable().optional(),
  brand_id: z.number().nullable().optional(),
  tax_id: z.number().nullable().optional(),
  tax_method: z.number().nullable().optional(),
  alert_quantity: z.number().nullable().optional(),
  image: z.instanceof(File).nullable().optional(),
  file: z.instanceof(File).nullable().optional(),
  is_variant: z.boolean().nullable().optional(),
  variant_option: z.array(z.string()).nullable().optional(),
  variant_value: z.array(z.string()).nullable().optional(),
  is_batch: z.boolean().nullable().optional(),
  is_imei: z.boolean().nullable().optional(),
  is_embeded: z.boolean().nullable().optional(),
  is_diffPrice: z.boolean().nullable().optional(),
  diff_price: z.array(z.object({
    warehouse_id: z.number(),
    price: z.number().nullable(),
  })).nullable().optional(),
  featured: z.boolean().nullable().optional(),
  promotion: z.boolean().nullable().optional(),
  promotion_price: z.string().nullable().optional(),
  starting_date: z.string().nullable().optional(),
  last_date: z.string().nullable().optional(),
  product_details: z.string().nullable().optional(),
  short_description: z.string().nullable().optional(),
  specification: z.string().nullable().optional(),
  warranty: z.number().nullable().optional(),
  warranty_type: z.string().nullable().optional(),
  guarantee: z.number().nullable().optional(),
  guarantee_type: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  tags: z.string().nullable().optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  is_sync_disable: z.boolean().nullable().optional(),
  is_online: z.boolean().nullable().optional(),
  in_stock: z.boolean().nullable().optional(),
  track_inventory: z.boolean().nullable().optional(),
  is_addon: z.boolean().nullable().optional(),
  extras: z.string().nullable().optional(),
  kitchen_id: z.number().nullable().optional(),
  menu_type: z.string().nullable().optional(),
  production_cost: z.union([z.string(), z.number()]).nullable().optional(),
  is_recipe: z.number().nullable().optional(),
  wastage_percent: z.union([z.string(), z.number()]).nullable().optional(),
  combo_unit_id: z.union([z.string(), z.number()]).nullable().optional(),
  // Combo products
  product_list: z.array(z.object({
    product_id: z.number(),
    product_name: z.string().optional(),
    product_code: z.string().optional(),
    variant_id: z.number().nullable().optional(),
    qty: z.number(),
    wastage_percent: z.number().optional(),
    combo_unit_id: z.number().optional(),
    unit_cost: z.number(),
    unit_price: z.number(),
  })).nullable().optional(),
  // Initial stock
  initial_stock: z.array(z.object({
    warehouse_id: z.number(),
    qty: z.number(),
  })).nullable().optional(),
})

type ProductForm = z.infer<typeof formSchema>

type ProductFormProps = {
  productId?: number
}

export function ProductForm({ productId }: ProductFormProps = {}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(!!productId)
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const [saleUnits, setSaleUnits] = useState<Record<number, string>>({})
  const [purchaseUnits, setPurchaseUnits] = useState<Record<number, string>>({})
  const [productUnits, setProductUnits] = useState<Record<number, Array<{id: number, name: string, operation_value: number, operator: string}>>>({})
  const [warehouses, setWarehouses] = useState<Array<{id: number, name: string}>>([])
  const isEdit = !!productId

  const form = useForm<ProductForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: null,
      type: "standard",
      barcode_symbology: "CODE128",
      category_id: 0,
      unit_id: 0,
      purchase_unit_id: null,
      sale_unit_id: null,
      cost: 0,
      price: 0,
      profit_margin: null,
      wholesale_price: null,
      daily_sale_objective: null,
      brand_id: null,
      tax_id: null,
      tax_method: null,
      alert_quantity: null,
      is_variant: false,
      variant_option: [],
      variant_value: [],
      is_batch: false,
      is_imei: false,
      is_embeded: false,
      is_diffPrice: false,
      diff_price: [],
      featured: false,
      promotion: false,
      promotion_price: null,
      starting_date: null,
      last_date: null,
      product_details: null,
      short_description: null,
      specification: null,
      warranty: null,
      warranty_type: null,
      guarantee: null,
      guarantee_type: null,
      slug: null,
      tags: null,
      meta_title: null,
      meta_description: null,
      is_sync_disable: false,
      is_online: false,
      in_stock: null,
      track_inventory: null,
      is_addon: null,
      extras: null,
      kitchen_id: null,
      menu_type: null,
      production_cost: null,
      is_recipe: null,
      wastage_percent: null,
      combo_unit_id: null,
      product_list: [],
      initial_stock: [],
      image: null,
      file: null,
    },
  })

  // Load product data if editing
  useEffect(() => {
    if (productId) {
      const loadProduct = async () => {
        try {
          setIsLoading(true)
          const product = await getProduct(productId)
          
          // Parse variant_option and variant_value if they're strings
          let variantOption: string[] = []
          let variantValue: string[] = []
          
          if (product.variant_option) {
            try {
              variantOption = typeof product.variant_option === 'string' 
                ? JSON.parse(product.variant_option) 
                : product.variant_option
            } catch {
              variantOption = Array.isArray(product.variant_option) ? product.variant_option : []
            }
          }
          
          if (product.variant_value) {
            try {
              variantValue = typeof product.variant_value === 'string'
                ? JSON.parse(product.variant_value)
                : product.variant_value
            } catch {
              variantValue = Array.isArray(product.variant_value) ? product.variant_value : []
            }
          }

          form.reset({
            name: product.name,
            code: product.code,
            type: product.type as "standard" | "combo" | "digital" | "service",
            barcode_symbology: product.barcode_symbology || "CODE128",
            category_id: product.category_id,
            unit_id: product.unit_id,
            purchase_unit_id: product.purchase_unit_id,
            sale_unit_id: product.sale_unit_id,
            cost: product.cost,
            price: product.price,
            profit_margin: product.profit_margin,
            wholesale_price: product.wholesale_price,
            daily_sale_objective: product.daily_sale_objective,
            brand_id: product.brand_id,
            tax_id: product.tax_id,
            tax_method: product.tax_method,
            alert_quantity: product.alert_quantity,
            is_variant: product.is_variant || false,
            variant_option: variantOption,
            variant_value: variantValue,
            is_batch: product.is_batch || false,
            is_imei: product.is_imei || false,
            is_embeded: product.is_embeded || false,
            is_diffPrice: product.is_diffPrice || false,
            diff_price: [],
            featured: product.featured || false,
            promotion: product.promotion || false,
            promotion_price: product.promotion_price,
            starting_date: product.starting_date,
            last_date: product.last_date,
            product_details: product.product_details,
            short_description: product.short_description,
            specification: product.specification,
            warranty: product.warranty,
            warranty_type: product.warranty_type,
            guarantee: product.guarantee,
            guarantee_type: product.guarantee_type,
            slug: product.slug,
            tags: product.tags,
            meta_title: product.meta_title,
            meta_description: product.meta_description,
            is_sync_disable: product.is_sync_disable || false,
            is_online: product.is_online || false,
            in_stock: product.in_stock,
            track_inventory: product.track_inventory,
            is_addon: product.is_addon,
            extras: product.extras,
            kitchen_id: product.kitchen_id,
            menu_type: product.menu_type,
            production_cost: product.production_cost ? (typeof product.production_cost === 'string' ? parseFloat(product.production_cost) : product.production_cost) : null,
            is_recipe: typeof product.is_recipe === 'boolean' ? (product.is_recipe ? 1 : 0) : (typeof product.is_recipe === 'number' ? product.is_recipe : null),
            wastage_percent: product.wastage_percent ? (typeof product.wastage_percent === 'string' ? parseFloat(product.wastage_percent) : product.wastage_percent) : null,
            combo_unit_id: product.combo_unit_id ? (typeof product.combo_unit_id === 'string' ? parseInt(product.combo_unit_id, 10) : product.combo_unit_id) : null,
            product_list: [],
            initial_stock: [],
            image: null,
            file: null,
          })

          // Load warehouse prices if is_diffPrice is true
          if (product.is_diffPrice && product.warehouse_prices) {
            // Wait for warehouses to load, then set prices
            const loadWarehousePrices = async () => {
              try {
                const response = await apiGetClient<Array<{id: number, name: string}>>("warehouses/dropdown")
                const warehousePricesMap = new Map(
                  product.warehouse_prices.map((wp: any) => [wp.warehouse_id, wp.price])
                )
                const diffPrices = response.data.map((warehouse) => {
                  const price = warehousePricesMap.get(warehouse.id)
                  return {
                    warehouse_id: warehouse.id,
                    price: typeof price === 'number' ? price : (price ? Number(price) : null),
                  }
                })
                form.setValue("diff_price", diffPrices)
              } catch (error) {
                console.error("Failed to load warehouse prices:", error)
              }
            }
            loadWarehousePrices()
          }

          // Load combo products if type is combo
          if (product.type === "combo") {
            // Handle null/empty product_list - check if it exists and is not empty
            if (!product.product_list || product.product_list.trim() === "") {
              // If no product_list, initialize empty array
              form.setValue("product_list", [])
            } else {
              const productIds = product.product_list.split(",").filter(Boolean).map(Number)
              const variantIds = (product.variant_list || "").split(",").map(v => {
                const trimmed = v?.trim()
                return trimmed && trimmed !== '' ? Number(trimmed) : null
              })
              const qtyList = (product.qty_list || "").split(",").filter(Boolean).map(Number)
              const priceList = (product.price_list || "").split(",").filter(Boolean).map(Number)
              const wastageList = (product.wastage_percent ? (typeof product.wastage_percent === 'string' ? product.wastage_percent : String(product.wastage_percent)) : "").split(",").filter(Boolean).map(Number)
              const comboUnitList = (product.combo_unit_id ? (typeof product.combo_unit_id === 'string' ? product.combo_unit_id : String(product.combo_unit_id)) : "").split(",").filter(Boolean).map(Number)

            // Fetch product details for each combo product
            const comboProducts = await Promise.all(
              productIds.map(async (productId, index) => {
                try {
                  const comboProduct = await getProduct(productId)
                  let productCode = comboProduct.code
                  
                  // If variant_id exists, get the variant's item_code (matching old system behavior)
                  if (variantIds[index]) {
                    try {
                      // Try product_variants first (direct relationship)
                      const productVariants = (comboProduct as any).product_variants || []
                      let variant = productVariants.find((v: any) => v.variant_id === variantIds[index])
                      
                      // If not found, try variants relationship (pivot)
                      if (!variant) {
                        const variants = (comboProduct as any).variants || []
                        variant = variants.find((v: any) => v.variant_id === variantIds[index] || v.id === variantIds[index])
                      }
                      
                      if (variant && variant.item_code) {
                        productCode = variant.item_code
                      }
                    } catch (error) {
                      console.error(`Failed to get variant item_code for product ${productId}, variant ${variantIds[index]}:`, error)
                    }
                  }
                  
                  return {
                    product_id: productId,
                    product_name: comboProduct.name,
                    product_code: productCode,
                    variant_id: variantIds[index] || null,
                    qty: qtyList[index] || 1,
                    wastage_percent: wastageList[index] || 0,
                    combo_unit_id: comboUnitList[index] || comboProduct.unit_id || undefined,
                    unit_cost: comboProduct.cost,
                    unit_price: priceList[index] || comboProduct.price,
                  }
                } catch {
                  // If product not found, return minimal data
                  return {
                    product_id: productId,
                    product_name: `Product ID: ${productId}`,
                    product_code: "",
                    variant_id: variantIds[index] || null,
                    qty: qtyList[index] || 1,
                    wastage_percent: wastageList[index] || 0,
                    combo_unit_id: comboUnitList[index] || undefined,
                    unit_cost: 0,
                    unit_price: priceList[index] || 0,
                  }
                }
              })
            )

            // Load units for each product
            const unitsMap: Record<number, Array<{id: number, name: string, operation_value: number, operator: string}>> = {}
            for (const comboProduct of comboProducts) {
              // Use the product's unit_id to get related units
              const unitIdToUse = comboProduct.combo_unit_id || comboProduct.product_id
              try {
                const comboProductData = await getProduct(comboProduct.product_id)
                const units = await getSaleUnits(comboProductData.unit_id)
                unitsMap[comboProduct.product_id] = Object.entries(units).map(([id, unitData]): {id: number, name: string, operation_value: number, operator: string} => {
                  if (typeof unitData === 'string') {
                    return {
                      id: parseInt(id),
                      name: unitData,
                      operation_value: 1,
                      operator: '*',
                    }
                  } else {
                    return {
                      id: parseInt(id),
                      name: unitData.name,
                      operation_value: unitData.operation_value,
                      operator: unitData.operator,
                    }
                  }
                })
              } catch {
                // If units not found, use empty array
                unitsMap[comboProduct.product_id] = []
              }
            }
            setProductUnits(unitsMap)

            form.setValue("product_list", comboProducts)
            }
          }
        } catch (error: any) {
          toast.error(error?.message || "Failed to load product")
          router.push("/products")
        } finally {
          setIsLoading(false)
        }
      }
      
      loadProduct()
    }
  }, [productId, form, router])

  const productType = form.watch("type")
  const isVariant = form.watch("is_variant")
  const isBatch = form.watch("is_batch")
  const isDiffPrice = form.watch("is_diffPrice")
  const promotion = form.watch("promotion")
  const isInitialStock = form.watch("initial_stock")?.length ? true : false
  const unitId = form.watch("unit_id")
  const productList = form.watch("product_list") || []

  // Load warehouses
  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const response = await apiGetClient<Array<{id: number, name: string}>>("warehouses/dropdown")
        setWarehouses(response.data)
      } catch (error) {
        console.error("Failed to load warehouses:", error)
      }
    }
    loadWarehouses()
  }, [])

  // Load sale/purchase units when unit_id changes
  useEffect(() => {
    if (unitId && (productType === "standard" || productType === "combo")) {
      const loadUnits = async () => {
        try {
          const units = await getSaleUnits(unitId)
          // Convert to Record<number, string> format for sale/purchase unit dropdowns
          const unitsMap: Record<number, string> = {}
          Object.entries(units).forEach(([id, unitData]) => {
            unitsMap[parseInt(id)] = typeof unitData === 'string' ? unitData : unitData.name
          })
          setSaleUnits(unitsMap)
          setPurchaseUnits(unitsMap)
        } catch (error) {
          console.error("Failed to load units:", error)
        }
      }
      loadUnits()
    } else {
      setSaleUnits({})
      setPurchaseUnits({})
    }
  }, [unitId, productType])

  const onSubmit = async (values: ProductForm) => {
    try {
      setIsSubmitting(true)
      const formData = new FormData()
      
      // Basic fields
      formData.append("name", values.name)
      if (values.code) formData.append("code", values.code)
      formData.append("type", values.type)
      if (values.barcode_symbology) formData.append("barcode_symbology", values.barcode_symbology)
      formData.append("category_id", String(values.category_id))
      
      // Units (only for non-digital/service)
      if (values.type !== "digital" && values.type !== "service") {
        formData.append("unit_id", String(values.unit_id))
        if (values.purchase_unit_id) formData.append("purchase_unit_id", String(values.purchase_unit_id))
        if (values.sale_unit_id) formData.append("sale_unit_id", String(values.sale_unit_id))
        formData.append("cost", String(values.cost))
      }
      
      formData.append("price", String(values.price))
      if (values.profit_margin !== null && values.profit_margin !== undefined) {
        formData.append("profit_margin", String(values.profit_margin))
      }
      if (values.wholesale_price !== null && values.wholesale_price !== undefined) {
        formData.append("wholesale_price", String(values.wholesale_price))
      }
      if (values.daily_sale_objective !== null && values.daily_sale_objective !== undefined) {
        formData.append("daily_sale_objective", String(values.daily_sale_objective))
      }
      if (values.brand_id) formData.append("brand_id", String(values.brand_id))
      if (values.tax_id) formData.append("tax_id", String(values.tax_id))
      if (values.tax_method !== null && values.tax_method !== undefined) {
        formData.append("tax_method", String(values.tax_method))
      }
      if (values.alert_quantity !== null && values.alert_quantity !== undefined) {
        formData.append("alert_quantity", String(values.alert_quantity))
      }
      
      // Boolean fields - convert to "1" or "0"
      if (values.is_variant !== null && values.is_variant !== undefined) {
        formData.append("is_variant", values.is_variant ? "1" : "0")
        if (values.is_variant && values.variant_option && values.variant_value) {
          formData.append("variant_option", JSON.stringify(values.variant_option))
          formData.append("variant_value", JSON.stringify(values.variant_value))
        }
      }
      if (values.is_batch !== null && values.is_batch !== undefined) {
        formData.append("is_batch", values.is_batch ? "1" : "0")
      }
      if (values.is_imei !== null && values.is_imei !== undefined) {
        formData.append("is_imei", values.is_imei ? "1" : "0")
      }
      if (values.is_embeded !== null && values.is_embeded !== undefined) {
        formData.append("is_embeded", values.is_embeded ? "1" : "0")
      }
      if (values.is_diffPrice !== null && values.is_diffPrice !== undefined) {
        formData.append("is_diffPrice", values.is_diffPrice ? "1" : "0")
        if (values.is_diffPrice && values.diff_price) {
          values.diff_price.forEach((item, index) => {
            formData.append(`warehouse_id[${index}]`, String(item.warehouse_id))
            if (item.price !== null) {
              formData.append(`diff_price[${index}]`, String(item.price))
            }
          })
        }
      }
      if (values.featured !== null && values.featured !== undefined) {
        formData.append("featured", values.featured ? "1" : "0")
      }
      // Handle promotion - send as "1" or "0" (Laravel will convert to boolean)
      if (values.promotion !== null && values.promotion !== undefined) {
        formData.append("promotion", values.promotion ? "1" : "0")
      }
      if (values.is_sync_disable !== null && values.is_sync_disable !== undefined) {
        formData.append("is_sync_disable", values.is_sync_disable ? "1" : "0")
      }
      if (values.is_online !== null && values.is_online !== undefined) {
        formData.append("is_online", values.is_online ? "1" : "0")
      }
      if (values.in_stock !== null && values.in_stock !== undefined) {
        formData.append("in_stock", values.in_stock ? "1" : "0")
      }
      if (values.track_inventory !== null && values.track_inventory !== undefined) {
        formData.append("track_inventory", values.track_inventory ? "1" : "0")
      }
      if (values.is_addon !== null && values.is_addon !== null) {
        formData.append("is_addon", values.is_addon ? "1" : "0")
      }
      
      // Promotion fields
      if (values.promotion_price) formData.append("promotion_price", values.promotion_price)
      if (values.starting_date) formData.append("starting_date", values.starting_date)
      if (values.last_date) formData.append("last_date", values.last_date)
      
      // Text fields
      if (values.product_details) formData.append("product_details", values.product_details)
      if (values.short_description) formData.append("short_description", values.short_description)
      if (values.specification) formData.append("specification", values.specification)
      if (values.slug) formData.append("slug", values.slug)
      
      // Warranty/Guarantee
      if (values.warranty !== null && values.warranty !== undefined) {
        formData.append("warranty", String(values.warranty))
        if (values.warranty_type) formData.append("warranty_type", values.warranty_type)
      }
      if (values.guarantee !== null && values.guarantee !== undefined) {
        formData.append("guarantee", String(values.guarantee))
        if (values.guarantee_type) formData.append("guarantee_type", values.guarantee_type)
      }
      
      // E-commerce fields
      if (values.tags) formData.append("tags", values.tags)
      if (values.meta_title) formData.append("meta_title", values.meta_title)
      if (values.meta_description) formData.append("meta_description", values.meta_description)
      
      // Restaurant fields
      if (values.extras) formData.append("extras", values.extras)
      if (values.kitchen_id) formData.append("kitchen_id", String(values.kitchen_id))
      if (values.menu_type) formData.append("menu_type", values.menu_type)
      if (values.production_cost !== null && values.production_cost !== undefined) {
        formData.append("production_cost", String(values.production_cost))
      }
      if (values.is_recipe !== null && values.is_recipe !== undefined) {
        formData.append("is_recipe", String(values.is_recipe))
      }
      
      // Combo products
      if (values.type === "combo" && values.product_list && values.product_list.length > 0) {
        const productIds: number[] = []
        const variantIds: (number | null)[] = []
        const qtyList: number[] = []
        const priceList: number[] = []
        const wastageList: number[] = []
        const comboUnitList: number[] = []

        values.product_list.forEach((item) => {
          productIds.push(item.product_id)
          variantIds.push(item.variant_id || null)
          qtyList.push(item.qty)
          priceList.push(item.unit_price)
          wastageList.push(item.wastage_percent || 0)
          comboUnitList.push(item.combo_unit_id || item.product_id) // Fallback to product unit_id if not set
        })

        // Send as arrays for processing (service will implode them)
        productIds.forEach((id, index) => {
          formData.append(`product_id[]`, String(id))
          formData.append(`variant_id[]`, variantIds[index] ? String(variantIds[index]) : "")
          formData.append(`product_qty[]`, String(qtyList[index]))
          formData.append(`unit_price[]`, String(priceList[index]))
          formData.append(`wastage_percent[]`, String(wastageList[index]))
          formData.append(`combo_unit_id[]`, String(comboUnitList[index]))
        })
      }
      
      // Initial stock
      if (values.initial_stock && values.initial_stock.length > 0) {
        values.initial_stock.forEach((item, index) => {
          formData.append(`stock_warehouse_id[${index}]`, String(item.warehouse_id))
          formData.append(`stock[${index}]`, String(item.qty))
        })
      }
      
      // File uploads
      if (values.image) formData.append("image", values.image)
      if (values.file) formData.append("file", values.file)
      
      let response
      if (isEdit && productId) {
        response = await updateProduct(productId, formData)
      } else {
        response = await createProduct(formData)
      }

      toast.success(
        response.message || (isEdit ? "Product updated successfully" : "Product created successfully")
      )

      queryClient.invalidateQueries({ queryKey: ["products"] })
      router.push("/products")
    } catch (error: any) {
      if (error?.errors && typeof error.errors === "object") {
        Object.entries(error.errors).forEach(([field, messages]) => {
          const fieldName = field as keyof ProductForm
          const errorMessages = Array.isArray(messages) ? messages : [messages]
          form.setError(fieldName, {
            type: "server",
            message: errorMessages[0] as string,
          })
        })
      }

      const errorMessage =
        error?.message || (error instanceof Error ? error.message : "An error occurred")
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">{isEdit ? "Edit Product" : "Add Product"}</h1>
        <p className="text-muted-foreground mt-1 text-sm italic">
          The field labels marked with * are required input fields.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>{isEdit ? "Update Product" : "Add Product"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Row 1: Type, Name, Code */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type *</FormLabel>
                      <FormControl>
                        <ProductTypeCombobox
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select product type..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Code *</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Auto-generated or enter manually"
                            {...field}
                            value={field.value || ""}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={isGeneratingCode}
                            onClick={async () => {
                              try {
                                setIsGeneratingCode(true)
                                const code = await generateProductCode()
                                form.setValue("code", code)
                                toast.success("Product code generated successfully")
                              } catch (error: any) {
                                toast.error(error?.message || "Failed to generate product code")
                              } finally {
                                setIsGeneratingCode(false)
                              }
                            }}
                          >
                            {isGeneratingCode ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 2: Barcode Symbology, Digital File (conditional) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="barcode_symbology"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode Symbology *</FormLabel>
                      <FormControl>
                        <BarcodeSymbologyCombobox
                          value={field.value || "C128"}
                          onValueChange={field.onChange}
                          placeholder="Select barcode symbology..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {productType === "digital" && (
                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>Attach File *</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept=".pdf,.zip,.rar,.doc,.docx"
                            onChange={(e) => {
                              const files = e.target.files
                              if (files && files.length > 0) {
                                onChange(files[0])
                              }
                            }}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Combo Products Section */}
              {productType === "combo" && (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <FormLabel className="text-base font-semibold">Add Product</FormLabel>
                    <div className="mt-2">
                      <ProductSearchCombobox
                        onProductSelect={(product) => {
                          // Check for duplicates
                          const currentList = form.getValues("product_list") || []
                          const isDuplicate = currentList.some(
                            (item) => item.product_id === product.id && 
                            (item.variant_id === product.variant_id || (!item.variant_id && !product.variant_id))
                          )
                          
                          if (isDuplicate) {
                            toast.error("Duplicate input is not allowed!")
                            return
                          }

                          // Store units for this product
                          if (product.units && product.units.length > 0) {
                            setProductUnits(prev => ({
                              ...prev,
                              [product.id]: product.units
                            }))
                          }

                          const newItem = {
                            product_id: product.id,
                            product_name: product.name,
                            product_code: product.code,
                            variant_id: product.variant_id,
                            qty: 1,
                            wastage_percent: 0,
                            combo_unit_id: product.unit_id,
                            unit_cost: product.cost,
                            unit_price: product.price,
                          }
                          form.setValue("product_list", [...currentList, newItem])
                        }}
                        placeholder="Please type product code and select"
                      />
                    </div>
                  </div>
                  <div>
                    <FormLabel className="text-base font-semibold">Combo Products</FormLabel>
                    <div className="mt-2 border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-left p-2 text-sm font-medium">Product</TableHead>
                            <TableHead className="text-left p-2 text-sm font-medium">Wastage %</TableHead>
                            <TableHead className="text-left p-2 text-sm font-medium">Quantity</TableHead>
                            <TableHead className="text-left p-2 text-sm font-medium">Unit Cost</TableHead>
                            <TableHead className="text-left p-2 text-sm font-medium">Unit Price</TableHead>
                            <TableHead className="text-left p-2 text-sm font-medium">Sub Total</TableHead>
                            <TableHead className="text-left p-2 text-sm font-medium"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {productList.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="p-4 text-center text-muted-foreground text-sm">
                                No products added yet
                              </TableCell>
                            </TableRow>
                          ) : (
                            productList.map((item, index) => {
                              const units = productUnits[item.product_id] || []
                              const qty = item.qty || 1
                              const unitPrice = item.unit_price || 0
                              const subtotal = qty * unitPrice

                              return (
                                <TableRow key={index}>
                                  <TableCell className="p-2 text-sm">
                                    {item.product_name || `Product ID: ${item.product_id}`}
                                    {item.product_code && (
                                      <span className="text-muted-foreground ml-1">
                                        [{item.product_code}]
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="p-2">
                                    <FormField
                                      control={form.control}
                                      name={`product_list.${index}.wastage_percent`}
                                      render={({ field }) => (
                                        <div className="flex items-center gap-1">
                                          <Input
                                            type="number"
                                            className="w-20 h-8"
                                            value={field.value || 0}
                                            onChange={(e) => {
                                              field.onChange(parseFloat(e.target.value) || 0)
                                            }}
                                            min="0"
                                            step="0.01"
                                          />
                                          <span className="text-sm">%</span>
                                        </div>
                                      )}
                                    />
                                  </TableCell>
                                  <TableCell className="p-2">
                                    <div className="flex items-center gap-1">
                                      <FormField
                                        control={form.control}
                                        name={`product_list.${index}.qty`}
                                        render={({ field }) => (
                                          <Input
                                            type="number"
                                            className="w-24 h-8"
                                            value={field.value || 1}
                                            onChange={(e) => {
                                              const newQty = parseFloat(e.target.value) || 1
                                              field.onChange(newQty)
                                            }}
                                            min="1"
                                            step="0.01"
                                          />
                                        )}
                                      />
                                      {units.length > 0 && (
                                        <FormField
                                          control={form.control}
                                          name={`product_list.${index}.combo_unit_id`}
                                          render={({ field }) => (
                                            <select
                                              className="h-8 px-2 text-sm border rounded-md"
                                              value={field.value || item.combo_unit_id || units[0]?.id}
                                              onChange={(e) => {
                                                field.onChange(parseInt(e.target.value))
                                              }}
                                            >
                                              {units.map((unit) => (
                                                <option key={unit.id} value={unit.id}>
                                                  {unit.name}
                                                </option>
                                              ))}
                                            </select>
                                          )}
                                        />
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="p-2">
                                    <FormField
                                      control={form.control}
                                      name={`product_list.${index}.unit_cost`}
                                      render={({ field }) => (
                                        <Input
                                          type="number"
                                          step="0.01"
                                          className="w-24 h-8"
                                          value={field.value || 0}
                                          onChange={(e) => {
                                            field.onChange(parseFloat(e.target.value) || 0)
                                          }}
                                        />
                                      )}
                                    />
                                  </TableCell>
                                  <TableCell className="p-2">
                                    <FormField
                                      control={form.control}
                                      name={`product_list.${index}.unit_price`}
                                      render={({ field }) => (
                                        <Input
                                          type="number"
                                          step="0.01"
                                          className="w-24 h-8"
                                          value={field.value || 0}
                                          onChange={(e) => {
                                            field.onChange(parseFloat(e.target.value) || 0)
                                          }}
                                        />
                                      )}
                                    />
                                  </TableCell>
                                  <TableCell className="p-2">
                                    <Input
                                      type="number"
                                      step="0.01"
                                      className="w-24 h-8"
                                      readOnly
                                      value={subtotal.toFixed(2)}
                                    />
                                  </TableCell>
                                  <TableCell className="p-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => {
                                        const currentList = form.getValues("product_list") || []
                                        const newList = currentList.filter((_, i) => i !== index)
                                        form.setValue("product_list", newList)
                                        // Remove units for this product
                                        setProductUnits(prev => {
                                          const updated = { ...prev }
                                          delete updated[item.product_id]
                                          return updated
                                        })
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}

              {/* Row 3: Brand, Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="brand_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                        <BrandCombobox
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <FormControl>
                        <CategoryCombobox
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Units Row - Only for non-digital/service */}
              {(productType === "standard" || productType === "combo") && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="unit_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Unit *</FormLabel>
                        <FormControl>
                          <UnitCombobox
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sale_unit_id"
                    render={({ field }) => {
                      const saleUnitOptions: ComboboxOption[] = Object.entries(saleUnits).map(([id, name]) => ({
                        value: id,
                        label: name,
                      }))
                      return (
                        <FormItem>
                          <FormLabel>Sale Unit</FormLabel>
                          <FormControl>
                            <Combobox
                              options={saleUnitOptions}
                              value={field.value?.toString()}
                              onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                              placeholder="Select sale unit..."
                              searchPlaceholder="Search units..."
                              emptyText="No units found."
                              disabled={!unitId || saleUnitOptions.length === 0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="purchase_unit_id"
                    render={({ field }) => {
                      const purchaseUnitOptions: ComboboxOption[] = Object.entries(purchaseUnits).map(([id, name]) => ({
                        value: id,
                        label: name,
                      }))
                      return (
                        <FormItem>
                          <FormLabel>Purchase Unit</FormLabel>
                          <FormControl>
                            <Combobox
                              options={purchaseUnitOptions}
                              value={field.value?.toString()}
                              onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                              placeholder="Select purchase unit..."
                              searchPlaceholder="Search units..."
                              emptyText="No units found."
                              disabled={!unitId || purchaseUnitOptions.length === 0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />
                </div>
              )}

              {/* Row 4: Cost, Profit Margin, Price - Only for non-digital/service */}
              {(productType === "standard" || productType === "combo") && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Cost *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profit_margin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profit Margin (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Price *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wholesale_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wholesale Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Row 5: Wholesale Price, Daily Sale Objective, Alert Quantity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="wholesale_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wholesale Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="daily_sale_objective"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Sale Objective</FormLabel>
                      <FormDescription className="text-xs">
                        Minimum qty which must be sold in a day
                      </FormDescription>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {productType === "standard" && (
                  <FormField
                    control={form.control}
                    name="alert_quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alert Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Row 6: Tax, Tax Method, Warranty */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="tax_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Tax</FormLabel>
                      <FormControl>
                        <TaxCombobox
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tax_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Method</FormLabel>
                      <FormDescription className="text-xs">
                        Exclusive: Product price = Actual product price + Tax
                        <br />
                        Inclusive: Actual product price = Product price - Tax
                      </FormDescription>
                      <FormControl>
                        <TaxMethodCombobox
                          value={field.value || 1}
                          onValueChange={field.onChange}
                          placeholder="Select tax method..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="warranty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warranty</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="eg: 1"
                            className="flex-1"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                            }
                          />
                        </FormControl>
                        <FormField
                          control={form.control}
                          name="warranty_type"
                          render={({ field: typeField }) => (
                            <FormControl>
                              <WarrantyTypeCombobox
                                value={typeField.value || "months"}
                                onValueChange={typeField.onChange}
                                placeholder="Type..."
                                className="w-32"
                              />
                            </FormControl>
                          )}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 7: Guarantee */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="guarantee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guarantee</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="eg: 1"
                            className="flex-1"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                            }
                          />
                        </FormControl>
                        <FormField
                          control={form.control}
                          name="guarantee_type"
                          render={({ field: typeField }) => (
                            <FormControl>
                              <GuaranteeTypeCombobox
                                value={typeField.value || "months"}
                                onValueChange={typeField.onChange}
                                placeholder="Type..."
                                className="w-32"
                              />
                            </FormControl>
                          )}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Checkboxes: Featured, Embedded Barcode, Initial Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t pt-4">
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Featured</FormLabel>
                        <FormDescription>
                          Featured product will be displayed in POS
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_embeded"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Embedded Barcode</FormLabel>
                        <FormDescription>
                          Check this if this product will be used in weight scale machine
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {productType === "standard" && !isVariant && !isBatch && (
                  <FormField
                    control={form.control}
                    name="initial_stock"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={isInitialStock}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                // Initialize with empty array - will be populated by user
                                field.onChange([])
                              } else {
                                field.onChange([])
                              }
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Initial Stock</FormLabel>
                          <FormDescription>
                            This feature will not work for product with variants and batches
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="is_variant"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>This product has variant</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_diffPrice"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>This product has different price for different warehouse</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Different Price for Different Warehouse Section */}
              {isDiffPrice && (
                <div className="space-y-4 border-t pt-4">
                  <FormLabel className="text-base font-semibold">Warehouse Prices</FormLabel>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Warehouse</TableHead>
                          <TableHead>Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {warehouses.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground">
                              Loading warehouses...
                            </TableCell>
                          </TableRow>
                        ) : (
                          warehouses.map((warehouse) => {
                            const currentPrices = form.watch("diff_price") || []
                            const existingPrice = currentPrices.find(p => p?.warehouse_id === warehouse.id)?.price
                            return (
                              <TableRow key={warehouse.id}>
                                <TableCell className="p-2 text-sm">
                                  {warehouse.name}
                                </TableCell>
                                <TableCell className="p-2">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    className="w-32 h-8"
                                    placeholder="0.00"
                                    value={existingPrice || ""}
                                    onChange={(e) => {
                                      const currentPrices = form.getValues("diff_price") || []
                                      const priceIndex = currentPrices.findIndex(p => p?.warehouse_id === warehouse.id)
                                      const updatedPrices = [...currentPrices]
                                      if (priceIndex >= 0) {
                                        updatedPrices[priceIndex] = {
                                          warehouse_id: warehouse.id,
                                          price: e.target.value ? parseFloat(e.target.value) : null,
                                        }
                                      } else {
                                        updatedPrices.push({
                                          warehouse_id: warehouse.id,
                                          price: e.target.value ? parseFloat(e.target.value) : null,
                                        })
                                      }
                                      form.setValue("diff_price", updatedPrices)
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            )
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Checkboxes: Featured, Embedded Barcode, Initial Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t pt-4">

                <FormField
                  control={form.control}
                  name="is_batch"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>This product has batch and expired date</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_imei"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>This product has IMEI or Serial numbers</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="promotion"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Add Promotional Price</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Promotional Price Section */}
              {promotion && (
                <div className="space-y-4 border-t pt-4">
                  <FormLabel className="text-base font-semibold">Promotional Price</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="promotion_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Promotional Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? e.target.value : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="starting_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Promotion Starts</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="last_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Promotion Ends</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Checkboxes: Featured, Embedded Barcode, Initial Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t pt-4">

                <FormField
                  control={form.control}
                  name="is_sync_disable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Disable Woocommerce Sync</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_online"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Sell Online</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="in_stock"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>In Stock</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Initial Stock Section */}
              {isInitialStock && productType === "standard" && !isVariant && !isBatch && (
                <div className="space-y-4 border-t pt-4">
                  <FormLabel className="text-base font-semibold">Initial Stock</FormLabel>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Warehouse</TableHead>
                          <TableHead>Qty</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Initial stock rows will be populated here */}
                        <TableRow>
                          <TableCell colSpan={2} className="text-center text-muted-foreground">
                            Warehouse list will be loaded here
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Product Image */}
              <div className="space-y-4 border-t pt-4">
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Product Image</FormLabel>
                      <FormDescription className="text-xs italic">
                        You can upload multiple image. Only jpeg, jpg, png, gif file can be uploaded. First image will be base image.
                      </FormDescription>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = e.target.files
                            if (files && files.length > 0) {
                              onChange(files[0])
                            }
                          }}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Product Details */}
              <div className="space-y-4 border-t pt-4">
                <FormField
                  control={form.control}
                  name="product_details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter product details"
                          rows={5}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="specification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specification</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Product specifications"
                        rows={4}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* E-commerce & SEO Fields */}
              <div className="space-y-4 border-t pt-4">
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Tags</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter tags separated by commas"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <h4 className="text-sm font-medium">For SEO</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="meta_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Meta title for SEO"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="meta_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Meta description for SEO"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Products</FormLabel>
                    <FormDescription>
                      Search and select related products
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder="Search products..."
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/products")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEdit ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    isEdit ? "Update Product" : "Add Product"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
}

