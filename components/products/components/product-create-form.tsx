"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CategoryCombobox } from "./category-combobox"
import { BrandCombobox } from "./brand-combobox"
import { UnitCombobox } from "./unit-combobox"
import { TaxCombobox } from "./tax-combobox"
import { createProduct } from "../data/products"
import { Plus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
  production_cost: z.string().nullable().optional(),
  is_recipe: z.number().nullable().optional(),
  wastage_percent: z.number().nullable().optional(),
  combo_unit_id: z.number().nullable().optional(),
  // Combo products
  product_list: z.array(z.object({
    product_id: z.number(),
    variant_id: z.number().nullable().optional(),
    qty: z.number(),
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

export function ProductCreateForm() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const productType = form.watch("type")
  const isVariant = form.watch("is_variant")
  const isBatch = form.watch("is_batch")
  const isDiffPrice = form.watch("is_diffPrice")
  const promotion = form.watch("promotion")
  const isInitialStock = form.watch("initial_stock")?.length ? true : false

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
      if (values.production_cost) formData.append("production_cost", values.production_cost)
      if (values.is_recipe !== null && values.is_recipe !== undefined) {
        formData.append("is_recipe", String(values.is_recipe))
      }
      
      // Combo products
      if (values.type === "combo" && values.product_list) {
        values.product_list.forEach((item, index) => {
          formData.append(`product_list[${index}]`, String(item.product_id))
          if (item.variant_id) formData.append(`variant_list[${index}]`, String(item.variant_id))
          formData.append(`qty_list[${index}]`, String(item.qty))
          formData.append(`price_list[${index}]`, String(item.unit_price))
        })
        if (values.wastage_percent) formData.append("wastage_percent", String(values.wastage_percent))
        if (values.combo_unit_id) formData.append("combo_unit_id", String(values.combo_unit_id))
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
      
      const response = await createProduct(formData)

      toast.success(
        response.message || "Product created successfully"
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Product</h1>
        <p className="text-muted-foreground mt-1">
          The field labels marked with * are required input fields.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Product name, code, type, and category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type *</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="combo">Combo</SelectItem>
                          <SelectItem value="digital">Digital</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <FormLabel>Product Code</FormLabel>
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
                            onClick={() => {
                              // Generate random code
                              const code = Math.random().toString(36).substring(2, 10).toUpperCase()
                              form.setValue("code", code)
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="barcode_symbology"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode Symbology</FormLabel>
                      <Select
                        value={field.value || "CODE128"}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CODE128">Code 128</SelectItem>
                          <SelectItem value="CODE39">Code 39</SelectItem>
                          <SelectItem value="UPC-A">UPC-A</SelectItem>
                          <SelectItem value="UPC-E">UPC-E</SelectItem>
                          <SelectItem value="EAN-8">EAN-8</SelectItem>
                          <SelectItem value="EAN-13">EAN-13</SelectItem>
                        </SelectContent>
                      </Select>
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
            </CardContent>
          </Card>

          {/* Units and Pricing - Only for non-digital/service */}
          {(productType === "standard" || productType === "combo") && (
            <Card>
              <CardHeader>
                <CardTitle>Units and Pricing</CardTitle>
                <CardDescription>Product units, cost, and pricing information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sale Unit</FormLabel>
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
                    name="purchase_unit_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Unit</FormLabel>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                {productType === "standard" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="daily_sale_objective"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Daily Sale Objective</FormLabel>
                          <FormDescription>
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
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tax Information */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <FormDescription>
                        Exclusive: Product price = Actual product price + Tax
                        <br />
                        Inclusive: Actual product price = Product price - Tax
                      </FormDescription>
                      <Select
                        value={field.value?.toString() || "1"}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Exclusive</SelectItem>
                          <SelectItem value="2">Inclusive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Warranty and Guarantee */}
          <Card>
            <CardHeader>
              <CardTitle>Warranty and Guarantee</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            min="0"
                            placeholder="Warranty period"
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
                              <Select
                                value={typeField.value || "months"}
                                onValueChange={typeField.onChange}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="days">Days</SelectItem>
                                  <SelectItem value="months">Months</SelectItem>
                                  <SelectItem value="years">Years</SelectItem>
                                </SelectContent>
                              </Select>
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
                  name="guarantee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guarantee</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Guarantee period"
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
                              <Select
                                value={typeField.value || "months"}
                                onValueChange={typeField.onChange}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="days">Days</SelectItem>
                                  <SelectItem value="months">Months</SelectItem>
                                  <SelectItem value="years">Years</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                          )}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Options */}
          <Card>
            <CardHeader>
              <CardTitle>Product Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </CardContent>
          </Card>

          {/* Promotion Fields */}
          {promotion && (
            <Card>
              <CardHeader>
                <CardTitle>Promotional Price</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          )}

          {/* Product Images and Files */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images and Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="image"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Product Image</FormLabel>
                    <FormDescription>
                      You can upload multiple images. Only jpeg, jpg, png, gif files can be uploaded. First image will be base image.
                    </FormDescription>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = e.target.files
                          if (files && files.length > 0) {
                            onChange(files[0]) // For now, just take the first file
                          }
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(productType === "digital" || productType === "service") && (
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
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="product_details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter product details"
                        rows={6}
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
                name="short_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief product description"
                        rows={3}
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
            </CardContent>
          </Card>

          {/* E-commerce Fields */}
          <Card>
            <CardHeader>
              <CardTitle>E-commerce & SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Add Product"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

