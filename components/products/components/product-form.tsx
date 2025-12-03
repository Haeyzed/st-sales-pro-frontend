"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
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
  getSaleUnits,
  type ComboProductSearchResult
} from "../data/products"
import { apiGetClient, apiDeleteClient } from "@/lib/api-client-client"
import { ProductSearchCombobox } from "./product-search-combobox"
import { MultipleProductSearchCombobox } from "./multiple-product-search-combobox"
import { Plus, X, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { TagInput } from "@/components/ui/tag-input"
import { DatePicker } from "@/components/ui/date-picker"
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload"
import { CloudUpload, ArrowLeft } from "lucide-react"
import { ProductDetailsEditor } from "./product-details-editor"
import { type Product } from "../data/schema"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemTitle } from "@/components/ui/item"
import Image from "next/image"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Type for existing images (URLs from backend)
type ExistingImage = {
  url: string
  filename: string
}

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
  tax_method: z.enum(["exclusive", "inclusive"]).nullable().optional(),
  alert_quantity: z.number().nullable().optional(),
  image: z.array(z.instanceof(File)).optional().default([]),
  file: z.instanceof(File).nullable().optional(),
  is_variant: z.boolean().nullable().optional(),
  variant_option: z.array(z.string()).nullable().optional(),
  variant_value: z.array(z.string()).nullable().optional(),
  variant_name: z.array(z.string()).nullable().optional(),
  item_code: z.array(z.string()).nullable().optional(),
  additional_cost: z.array(z.number()).nullable().optional(),
  additional_price: z.array(z.number()).nullable().optional(),
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
  related_products: z.string().nullable().optional(), // Comma-separated product IDs
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
    product_image: z.string().optional(),
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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(!!productId)
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const [saleUnits, setSaleUnits] = useState<Record<number, string>>({})
  const [purchaseUnits, setPurchaseUnits] = useState<Record<number, string>>({})
  const [productUnits, setProductUnits] = useState<Record<number, Array<{id: number, name: string, operation_value: number, operator: string}>>>({})
  const [warehouses, setWarehouses] = useState<Array<{id: number, name: string}>>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [relatedProducts, setRelatedProducts] = useState<Array<ComboProductSearchResult>>([])
  const isEdit = !!productId

  const form = useForm<ProductForm>({
    resolver: zodResolver(formSchema) as any,
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
      variant_name: [],
      item_code: [],
      additional_cost: [],
      additional_price: [],
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
      image: [],
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
            tax_method: product.tax_method as "exclusive" | "inclusive" | null,
            alert_quantity: product.alert_quantity,
            is_variant: product.is_variant || false,
            variant_option: variantOption,
            variant_value: variantValue,
            variant_name: product.product_variants?.map(v => {
              // Find the variant name from the variants relationship
              const variant = product.variants?.find(vv => vv.variant_id === v.variant_id)
              return variant?.name || ""
            }).filter(n => n) || [],
            item_code: product.product_variants?.map(v => v.item_code || "") || [],
            additional_cost: product.product_variants?.map(v => v.additional_cost || 0) || [],
            additional_price: product.product_variants?.map(v => v.additional_price || 0) || [],
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
            image: [],
            file: null,
          })

          // Load warehouse prices if is_diffPrice is true
          if (product.is_diffPrice && product.warehouse_prices && product.warehouse_prices.length > 0) {
            // Wait for warehouses to load, then set prices
            const loadWarehousePrices = async () => {
              try {
                const response = await apiGetClient<Array<{id: number, name: string}>>("warehouses/dropdown")
                const warehousePricesMap = new Map(
                  product.warehouse_prices!.map((wp: any) => [wp.warehouse_id, wp.price])
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

          // Load existing images
          if (product.image && product.image !== 'zummXD2dvAtI.png') {
            const imageNames = product.image.split(',').map(img => img.trim()).filter(Boolean)
            setExistingImages(imageNames)
          }

          // Load related products
          if (product.related_products) {
            const relatedIds = product.related_products.split(',').filter(Boolean).map(Number)
            if (relatedIds.length > 0) {
              try {
                const relatedProductsData = await Promise.all(
                  relatedIds.map(id => getProduct(id))
                )
                const relatedProductsList = relatedProductsData.map(p => ({
                  id: p.id,
                  name: p.name,
                  code: p.code,
                  price: p.price,
                  cost: p.cost,
                  qty: p.qty || 0,
                  brand: p.brand?.title || '',
                  unit_id: p.unit_id,
                  variant_id: null,
                  additional_price: 0,
                  image: p.image || undefined,
                  units: []
                })) as ComboProductSearchResult[]
                setRelatedProducts(relatedProductsList)
              } catch (error) {
                console.error("Failed to load related products:", error)
              }
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
  const productCode = form.watch("code") || ""

  // Generate variant combinations from options and values
  const generateVariantCombinations = () => {
    const options = form.getValues("variant_option") || []
    const values = form.getValues("variant_value") || []
    
    // Filter out empty options
    const validOptions = options.filter((opt, idx) => opt && opt.trim() && values[idx] && values[idx].trim())
    const validValues = values.filter((val, idx) => options[idx] && options[idx].trim() && val && val.trim())
    
    if (validOptions.length === 0 || validValues.length === 0) {
      form.setValue("variant_name", [])
      form.setValue("item_code", [])
      form.setValue("additional_cost", [])
      form.setValue("additional_price", [])
      return
    }

    // Parse values (comma-separated)
    const parsedValues = validValues.map(val => 
      val.split(",").map(v => v.trim()).filter(v => v)
    )

    // Generate all combinations
    let combinations: string[] = parsedValues[0] || []
    
    for (let i = 1; i < parsedValues.length; i++) {
      const newCombinations: string[] = []
      combinations.forEach(combo => {
        parsedValues[i].forEach(val => {
          newCombinations.push(`${combo}/${val}`)
        })
      })
      combinations = newCombinations
    }

    // Get existing variant data to preserve item_code, additional_cost, additional_price
    const existingVariants = form.getValues("variant_name") || []
    const existingItemCodes = form.getValues("item_code") || []
    const existingCosts = form.getValues("additional_cost") || []
    const existingPrices = form.getValues("additional_price") || []
    
    const existingMap = new Map<string, { item_code: string; cost: number; price: number }>()
    existingVariants.forEach((name, idx) => {
      if (name) {
        existingMap.set(name, {
          item_code: existingItemCodes[idx] || "",
          cost: existingCosts[idx] || 0,
          price: existingPrices[idx] || 0,
        })
      }
    })

    // Update form with new combinations
    const variantNames: string[] = []
    const itemCodes: string[] = []
    const costs: number[] = []
    const prices: number[] = []

    combinations.forEach(combo => {
      variantNames.push(combo)
      const existing = existingMap.get(combo)
      itemCodes.push(existing?.item_code || `${combo}-${productCode}`)
      costs.push(existing?.cost || 0)
      prices.push(existing?.price || 0)
    })

    form.setValue("variant_name", variantNames)
    form.setValue("item_code", itemCodes)
    form.setValue("additional_cost", costs)
    form.setValue("additional_price", prices)
  }

  // Watch for changes in variant options/values to regenerate combinations
  const variantOptions = form.watch("variant_option") || []
  const variantValues = form.watch("variant_value") || []
  
  useEffect(() => {
    if (isVariant) {
      // Only generate if we have at least one complete option/value pair
      const hasCompletePair = variantOptions.some((opt, idx) => opt && opt.trim() && variantValues[idx] && variantValues[idx].trim())
      
      if (hasCompletePair) {
        generateVariantCombinations()
      }
    }
  }, [isVariant, variantOptions, variantValues])
  
  // Initialize variant option/value arrays when is_variant is checked
  useEffect(() => {
    if (isVariant && (!variantOptions || variantOptions.length === 0)) {
      form.setValue("variant_option", [""])
      form.setValue("variant_value", [""])
    } else if (!isVariant) {
      // Clear variant data when unchecked
      form.setValue("variant_option", [])
      form.setValue("variant_value", [])
      form.setValue("variant_name", [])
      form.setValue("item_code", [])
      form.setValue("additional_cost", [])
      form.setValue("additional_price", [])
    }
  }, [isVariant])

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

  // Handle product type changes - clear incompatible options (only on user interaction, not initial load)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
  useEffect(() => {
    // Skip on initial load to preserve loaded product data
    if (isInitialLoad) {
      setIsInitialLoad(false)
      return
    }

    if (productType === "combo") {
      // Combo products: hide variant, diffPrice, batch, imei, initial stock options
      form.setValue("is_variant", false)
      form.setValue("is_diffPrice", false)
      form.setValue("is_batch", false)
      form.setValue("is_imei", false)
      form.setValue("initial_stock", [])
    } else if (productType === "digital") {
      // Digital products: hide variant, diffPrice, batch options
      // Show initial stock option
      form.setValue("is_variant", false)
      form.setValue("is_diffPrice", false)
      form.setValue("is_batch", false)
    } else if (productType === "service") {
      // Service products: hide all special options
      form.setValue("is_variant", false)
      form.setValue("is_diffPrice", false)
      form.setValue("is_batch", false)
      form.setValue("is_imei", false)
    }
    // Standard products can have all options
  }, [productType])

  // Handle is_batch changes - hide variant and initial stock options
  useEffect(() => {
    if (isBatch) {
      form.setValue("is_variant", false)
      form.setValue("initial_stock", [])
      form.setValue("featured", false)
    }
  }, [isBatch])

  // Handle is_imei changes - hide initial stock
  useEffect(() => {
    if (form.watch("is_imei")) {
      form.setValue("initial_stock", [])
      form.setValue("featured", false)
    }
  }, [form.watch("is_imei")])

  // Handle is_variant changes - hide batch and initial stock
  useEffect(() => {
    if (isVariant) {
      form.setValue("is_batch", false)
      form.setValue("initial_stock", [])
    }
  }, [isVariant])

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
        if (values.is_variant) {
          // Submit variant options and values for frontend display
          if (values.variant_option && values.variant_value) {
            formData.append("variant_option", JSON.stringify(values.variant_option))
            formData.append("variant_value", JSON.stringify(values.variant_value))
          }
          // Submit variant details for backend processing
          if (values.variant_name && values.variant_name.length > 0) {
            values.variant_name.forEach((name, index) => {
              formData.append(`variant_name[]`, name)
              if (values.item_code && values.item_code[index]) {
                formData.append(`item_code[]`, values.item_code[index])
              } else {
                formData.append(`item_code[]`, "")
              }
              if (values.additional_cost && values.additional_cost[index] !== undefined) {
                formData.append(`additional_cost[]`, String(values.additional_cost[index] || 0))
              } else {
                formData.append(`additional_cost[]`, "0")
              }
              if (values.additional_price && values.additional_price[index] !== undefined) {
                formData.append(`additional_price[]`, String(values.additional_price[index] || 0))
              } else {
                formData.append(`additional_price[]`, "0")
              }
            })
          }
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
      if (values.related_products) formData.append("related_products", values.related_products)
      if (values.slug) formData.append("slug", values.slug)
      if (values.short_description) formData.append("short_description", values.short_description)
      if (values.specification) formData.append("specification", values.specification)
      
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
      // Handle multiple images
      if (values.image && values.image.length > 0) {
        values.image.forEach((file) => {
          formData.append("image[]", file)
        })
      }
      
      // Handle previous images (for edit)
      if (isEdit && existingImages.length > 0) {
        existingImages.forEach((filename) => {
          formData.append("prev_img[]", filename)
        })
      }
      
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
      <div className="">
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Spinner className="h-8 w-8" />
          {/* <p className="text-muted-foreground text-sm">Loading product...</p> */}
        </div>
      </div>
    )
  }

  return (
    <div className="">
      <div className="mb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/products")}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{isEdit ? "Edit Product" : "Add Product"}</h1>
            <p className="text-muted-foreground mt-1 text-sm italic">
              The field labels marked with * are required input fields.
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Row 1: Type, Name, Code */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type <span className="text-red-500">*</span></FormLabel>
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
                      <FormLabel>Product Name <span className="text-red-500">*</span></FormLabel>
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
                      <FormLabel>Product Code <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <div className="flex rounded-md shadow-xs">
                          <Input
                            placeholder="Auto-generated or enter manually"
                            {...field}
                            value={field.value || ""}
                            className="-me-px rounded-r-none shadow-none focus-visible:z-10"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={isGeneratingCode}
                            className="rounded-l-none shadow-none"
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
                            title="Generate code"
                          >
                            {isGeneratingCode ? (
                              <Spinner className="h-4 w-4" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 2: Barcode, Brand, Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="barcode_symbology"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode Symbology <span className="text-red-500">*</span></FormLabel>
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
                      <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
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

              {/* Digital File Upload - Only for digital products */}
              {productType === "digital" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>Attach File <span className="text-red-500">*</span></FormLabel>
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
                </div>
              )}

              {/* Combo Products Section */}
              {productType === "combo" && (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <FormLabel className="text-base font-semibold">Add Products</FormLabel>
                    <div className="mt-2">
                      <MultipleProductSearchCombobox
                        selectedProducts={productList.map((item): ComboProductSearchResult => ({
                          id: item.product_id,
                          name: item.product_name || '',
                          code: item.product_code || '',
                          price: item.unit_price || 0,
                          cost: item.unit_cost || 0,
                          qty: item.qty || 1,
                          brand: '',
                          unit_id: item.combo_unit_id || 0,
                          variant_id: item.variant_id || null,
                          additional_price: 0,
                          image: item.product_image ?? undefined,
                          units: (productUnits[item.product_id] || []).map(u => ({ ...u, selected: false }))
                        }))}
                        onProductsChange={(products) => {
                          // Update product list
                          const newProductList = products.map(product => ({
                            product_id: product.id,
                            product_name: product.name,
                            product_code: product.code,
                            product_image: product.image,
                            variant_id: product.variant_id,
                            qty: product.qty || 1,
                            wastage_percent: 0,
                            combo_unit_id: product.unit_id,
                            unit_cost: product.cost,
                            unit_price: product.price,
                          }))
                          
                          form.setValue("product_list", newProductList)
                          
                          // Update units for all products
                          const newUnits: Record<number, Array<{id: number, name: string, operation_value: number, operator: string}>> = {}
                          products.forEach(product => {
                            if (product.units && product.units.length > 0) {
                              newUnits[product.id] = product.units
                            }
                          })
                          setProductUnits(newUnits)
                        }}
                        placeholder="Search and select products..."
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

                              const firstImage = item.product_image?.split(',')[0]?.trim()
                              const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'
                              const imageUrl = firstImage && firstImage !== 'zummXD2dvAtI.png' ? `${apiUrl}/storage/products/small/${firstImage}` : null
                              const initials = (item.product_name || 'P')
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)

                              return (
                                <TableRow key={index}>
                                  <TableCell className="p-2">
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-8 w-8 rounded-md">
                                        {imageUrl ? (
                                          <AvatarImage src={imageUrl} alt={item.product_name || 'Product'} className="object-cover" />
                                        ) : null}
                                        <AvatarFallback className="bg-muted text-muted-foreground rounded-md text-xs">
                                          {initials}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex flex-col">
                                        <span className="text-sm font-medium">{item.product_name || `Product ID: ${item.product_id}`}</span>
                                        {item.product_code && (
                                          <span className="text-xs text-muted-foreground">
                                            {item.product_code}
                                          </span>
                                        )}
                                      </div>
                                    </div>
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
                                    <div className="flex rounded-md shadow-xs">
                                      <FormField
                                        control={form.control}
                                        name={`product_list.${index}.qty`}
                                        render={({ field }) => (
                                          <FormControl>
                                            <Input
                                              type="number"
                                              className="h-9 w-24 -me-px rounded-r-none shadow-none focus-visible:z-10"
                                              value={field.value || 1}
                                              onChange={(e) => {
                                                const newQty = parseFloat(e.target.value) || 1
                                                field.onChange(newQty)
                                              }}
                                              min="1"
                                              step="0.01"
                                            />
                                          </FormControl>
                                        )}
                                      />
                                      {units.length > 0 && (
                                        <FormField
                                          control={form.control}
                                          name={`product_list.${index}.combo_unit_id`}
                                          render={({ field }) => (
                                            <FormControl>
                                              <Combobox
                                                options={units.map(u => ({ value: String(u.id), label: u.name }))}
                                                value={String(field.value || item.combo_unit_id || units[0]?.id)}
                                                onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                                                placeholder="Unit"
                                                emptyText="No units"
                                                searchPlaceholder="Search units..."
                                                className="h-9 w-28 rounded-l-none shadow-none"
                                              />
                                            </FormControl>
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

              {/* Row 3: Units - Only for non-digital/service */}
              {(productType === "standard" || productType === "combo") && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="unit_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Unit <span className="text-red-500">*</span></FormLabel>
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
                        <FormLabel>Product Cost <span className="text-red-500">*</span></FormLabel>
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
                        <FormLabel>Product Price <span className="text-red-500">*</span></FormLabel>
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
                          value={field.value || "exclusive"}
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
                      <div className="flex rounded-md shadow-xs">
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="eg: 1"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                            }
                            className="-me-px rounded-r-none shadow-none focus-visible:z-10"
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
                                className="w-32 rounded-l-none shadow-none"
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

              {/* Row 7: Guarantee, Image Upload */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="guarantee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guarantee</FormLabel>
                      <div className="flex rounded-md shadow-xs">
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="eg: 1"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                            }
                            className="-me-px rounded-r-none shadow-none focus-visible:z-10"
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
                                className="w-32 rounded-l-none shadow-none"
                              />
                            </FormControl>
                          )}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
              </div>

              {/* Checkboxes Row 1: Featured, Embedded Barcode */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t pt-4">
              
                {productType === "standard" && !form.watch("is_batch") && (
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
                )}

                {productType === "standard" && (
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
                )}
              </div>

              {/* Variant Section */}
              {isVariant && productType === "standard" && (
                <div className="space-y-4 border-t pt-4">
                  <FormLabel className="text-base font-semibold">Product Variants</FormLabel>
                  
                  {/* Variant Option/Value Inputs */}
                  <div className="space-y-3">
                    {form.watch("variant_option")?.map((option, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-4">
                          <FormField
                            control={form.control}
                            name={`variant_option.${index}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Option <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., Size, Color"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-7">
                          <FormField
                            control={form.control}
                            name={`variant_value.${index}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Value <span className="text-red-500">*</span> (comma-separated)</FormLabel>
                                <FormControl>
                                  <TagInput
                                    value={field.value ? field.value.split(',').map(v => v.trim()).filter(Boolean) : []}
                                    onChange={(tags) => {
                                      field.onChange(tags.join(','))
                                      // Generate combinations when values change (debounced)
                                      setTimeout(() => {
                                        generateVariantCombinations()
                                      }, 300)
                                    }}
                                    placeholder="Type value and press Enter or comma..."
                                    separator=","
                                    allowDuplicates={false}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const options = form.getValues("variant_option") || []
                              const values = form.getValues("variant_value") || []
                              options.splice(index, 1)
                              values.splice(index, 1)
                              form.setValue("variant_option", options)
                              form.setValue("variant_value", values)
                              generateVariantCombinations()
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const options = form.getValues("variant_option") || []
                        const values = form.getValues("variant_value") || []
                        form.setValue("variant_option", [...options, ""])
                        form.setValue("variant_value", [...values, ""])
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add More Variant Option
                    </Button>
                  </div>

                  {/* Variant Combinations Table */}
                  {form.watch("variant_name") && form.watch("variant_name")!.length > 0 && (
                    <div className="border rounded-md mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Item Code</TableHead>
                            <TableHead>Additional Cost</TableHead>
                            <TableHead>Additional Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {form.watch("variant_name")!.map((name, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{name}</TableCell>
                              <TableCell>
                                <FormField
                                  control={form.control}
                                  name={`item_code.${index}`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          value={field.value || ""}
                                          placeholder="Item code"
                                          className="w-32"
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </TableCell>
                              <TableCell>
                                <FormField
                                  control={form.control}
                                  name={`additional_cost.${index}`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          {...field}
                                          value={field.value || 0}
                                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                          className="w-32"
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </TableCell>
                              <TableCell>
                                <FormField
                                  control={form.control}
                                  name={`additional_price.${index}`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          {...field}
                                          value={field.value || 0}
                                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                          className="w-32"
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}

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

              {/* Checkboxes: Batch, IMEI, Promotion - Only for Standard Products */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t pt-4">

                {productType === "standard" && (
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
                )}

                {productType === "standard" && (
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
                )}

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
                            <DatePicker
                              value={field.value ? new Date(field.value) : null}
                              onChange={(date) => {
                                if (date) {
                                  field.onChange(format(date, "yyyy-MM-dd"))
                                } else {
                                  field.onChange(null)
                                }
                              }}
                              placeholder="Select start date"
                              minDate={new Date()}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="last_date"
                      render={({ field }) => {
                        const startDate = form.watch("starting_date")
                        const minDate = startDate ? new Date(startDate) : new Date()
                        
                        return (
                          <FormItem>
                            <FormLabel>Promotion Ends</FormLabel>
                            <FormControl>
                              <DatePicker
                                value={field.value ? new Date(field.value) : null}
                                onChange={(date) => {
                                  if (date) {
                                    field.onChange(format(date, "yyyy-MM-dd"))
                                  } else {
                                    field.onChange(null)
                                  }
                                }}
                                placeholder="Select end date"
                                minDate={minDate}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )
                      }}
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Image</FormLabel>
                      <FormDescription className="text-xs">
                        Only jpeg, jpg, png, gif files. First image will be base image.
                      </FormDescription>
                      <FormControl>
                        <FileUpload
                          value={field.value || []}
                          onValueChange={field.onChange}
                          accept="image/jpeg,image/jpg,image/png,image/gif"
                          maxFiles={10}
                          maxSize={10 * 1024 * 1024} // 10MB
                          multiple
                          onFileReject={(_, message) => {
                            toast.error(message)
                          }}
                        >
                          <FileUploadDropzone>
                            <CloudUpload className="h-4 w-4" />
                            <span className="text-sm">Drop files here or</span>
                            <FileUploadTrigger asChild>
                              <Button variant="link" size="sm" className="p-0 h-auto">
                                choose files
                              </Button>
                            </FileUploadTrigger>
                          </FileUploadDropzone>

                          {/* Show existing images */}
                          {existingImages.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Existing Images:</p>
                              <div className="grid grid-cols-2 gap-2">
                                {existingImages.map((imageName, index) => (
                                  <div key={imageName} className="relative flex items-center gap-2 rounded-md border p-2">
                                    <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded border bg-accent/50">
                                      <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/products/small/${imageName}`}
                                        alt={`Product ${index + 1}`}
                                        className="size-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{imageName}</p>
                                      {index === 0 && (
                                        <Badge variant="secondary" className="text-xs">Base Image</Badge>
                                      )}
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={async () => {
                                        if (!productId) {
                                          // If not editing, just remove from state
                                          setExistingImages(prev => prev.filter(img => img !== imageName))
                                          return
                                        }

                                        try {
                                          // Call API to delete the image from server
                                          const response = await apiDeleteClient(
                                            `products/${productId}/image`,
                                            { image: imageName }
                                          )

                                          // Remove from state only after successful deletion
                                          setExistingImages(prev => prev.filter(img => img !== imageName))
                                          toast.success(response.message || "Image deleted successfully")
                                        } catch (error: any) {
                                          toast.error(error?.message || "Failed to delete image")
                                        }
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Show new uploads */}
                          <FileUploadList>
                            {field.value?.map((file, index) => (
                              <FileUploadItem key={index} value={file}>
                                <FileUploadItemPreview />
                                <FileUploadItemMetadata />
                                <FileUploadItemDelete asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </FileUploadItemDelete>
                              </FileUploadItem>
                            ))}
                          </FileUploadList>
                        </FileUpload>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Product Details */}
              <FormField
                control={form.control}
                name="product_details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Details</FormLabel>
                    <FormControl>
                      <ProductDetailsEditor
                        value={field.value || undefined}
                        onChange={field.onChange}
                        placeholder="Enter product details..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      <TagInput
                        value={field.value ? field.value.split(',').map(v => v.trim()).filter(Boolean) : []}
                        onChange={(tags) => {
                          field.onChange(tags.length > 0 ? tags.join(',') : null)
                        }}
                        placeholder="Type tag and press Enter or comma..."
                        separator=","
                        allowDuplicates={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 mt-8">
                <h4 className="text-base font-semibold">For SEO</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="meta_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title <span className="text-red-500">*</span></FormLabel>
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
                        <FormLabel>Meta Description <span className="text-red-500">*</span></FormLabel>
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

              {/* Related Products Section */}
              <div className="space-y-4 mt-6">
                <h4 className="text-base font-semibold">Related Products</h4>
                <MultipleProductSearchCombobox
                  selectedProducts={relatedProducts}
                  onProductsChange={(products) => {
                    setRelatedProducts(products)
                    // Convert to comma-separated IDs
                    const productIds = products.map(p => p.id).join(',')
                    form.setValue("related_products", productIds || null)
                  }}
                  placeholder="Search and select related products..."
                  warehouseId={null}
                />

                {/* Display Selected Related Products */}
                {relatedProducts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">Selected Products</h4>
                    <ItemGroup className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                      {relatedProducts.map((product) => {
                        const firstImage = product.image?.split(',')[0]?.trim()
                        const imageUrl = firstImage && firstImage !== 'zummXD2dvAtI.png' ? `${apiUrl}/storage/products/small/${firstImage}` : null
                        const initials = product.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

                        return (
                          <Item key={`${product.id}-${product.variant_id || 0}`} variant="outline" className="relative group">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = relatedProducts.filter(p => !(p.id === product.id && p.variant_id === product.variant_id))
                                setRelatedProducts(updated)
                                const productIds = updated.map(p => p.id).join(',')
                                form.setValue("related_products", productIds || null)
                              }}
                              className="absolute top-1 right-1 z-10 h-6 w-6 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <ItemHeader>
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={product.name}
                                  width={96}
                                  height={96}
                                  className="aspect-square w-full object-cover"
                                />
                              ) : (
                                <div className="aspect-square w-full bg-muted flex items-center justify-center">
                                  <span className="text-lg font-semibold text-muted-foreground">
                                    {initials}
                                  </span>
                                </div>
                              )}
                            </ItemHeader>
                            <ItemContent>
                              <ItemTitle className="line-clamp-2 text-xs">{product.name}</ItemTitle>
                              <ItemDescription className="text-[10px]">{product.code}</ItemDescription>
                            </ItemContent>
                          </Item>
                        )
                      })}
                    </ItemGroup>
                  </div>
                )}
              </div>

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
                      <Spinner className="mr-2 h-4 w-4" />
                      {isEdit ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    isEdit ? "Update Product" : "Add Product"
                  )}
                </Button>
              </div>
        </form>
      </Form>
    </div>
  )
}

