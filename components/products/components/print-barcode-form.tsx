"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MultipleProductSearchCombobox } from "./multiple-product-search-combobox"
import { BarcodeSettingsCombobox } from "./barcode-settings-combobox"
import { X, Printer, ArrowLeft } from "lucide-react"
import type { ComboProductSearchResult } from "../data/products"
import Image from "next/image"

const printSchema = z.object({
  barcode_setting_id: z.number({
    message: "Please select a barcode setting",
  }),
  print_name: z.boolean().default(true),
  name_size: z.number().default(15),
  print_price: z.boolean().default(true),
  price_size: z.number().default(15),
  print_promo_price: z.boolean().default(false),
  promo_price_size: z.number().default(15),
  print_business_name: z.boolean().default(true),
  business_name_size: z.number().default(15),
  print_brand_name: z.boolean().default(true),
  brand_name_size: z.number().default(15),
})

type PrintFormValues = z.infer<typeof printSchema>

type BarcodeProduct = {
  product: ComboProductSearchResult
  quantity: number
}

interface PrintBarcodeFormProps {
  preloadedProduct?: string | null
}

export function PrintBarcodeForm({ preloadedProduct }: PrintBarcodeFormProps) {
  const router = useRouter()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000"
  const [selectedProducts, setSelectedProducts] = useState<ComboProductSearchResult[]>([])
  const [products, setProducts] = useState<BarcodeProduct[]>([])

  const form = useForm<PrintFormValues>({
    resolver: zodResolver(printSchema) as any,
    defaultValues: {
      print_name: true,
      name_size: 15,
      print_price: true,
      price_size: 15,
      print_promo_price: false,
      promo_price_size: 15,
      print_business_name: true,
      business_name_size: 15,
      print_brand_name: true,
      brand_name_size: 15,
    },
  })

  const handleProductsChange = (newProducts: ComboProductSearchResult[]) => {
    setSelectedProducts(newProducts)

    // Update products list with quantities
    const updatedProducts: BarcodeProduct[] = newProducts.map((product) => {
      // Check if product already exists in products list to preserve quantity
      const existing = products.find((p) => p.product.id === product.id && p.product.variant_id === product.variant_id)
      return {
        product,
        quantity: existing?.quantity || 1,
      }
    })

    setProducts(updatedProducts)
  }

  const removeProduct = (productId: number, variantId: number | null) => {
    setProducts(products.filter((p) => !(p.product.id === productId && p.product.variant_id === variantId)))
  }

  const updateQuantity = (productId: number, variantId: number | null, quantity: number) => {
    setProducts(
      products.map((p) =>
        p.product.id === productId && p.product.variant_id === variantId
          ? { ...p, quantity: Math.max(1, quantity) }
          : p,
      ),
    )
  }

  const onSubmit = (values: PrintFormValues) => {
    if (products.length === 0) {
      toast.error("Please add at least one product")
      return
    }

    // Create query params for print page
    const params = new URLSearchParams()
    params.set("barcode_setting_id", String(values.barcode_setting_id))

    // Print options
    if (values.print_name) params.set("print_name", "1")
    params.set("print_name_size", String(values.name_size))

    if (values.print_price) params.set("print_price", "1")
    params.set("print_price_size", String(values.price_size))

    if (values.print_promo_price) params.set("print_promo_price", "1")
    params.set("print_promo_price_size", String(values.promo_price_size))

    if (values.print_business_name) params.set("print_business_name", "1")
    params.set("print_business_name_size", String(values.business_name_size))

    if (values.print_brand_name) params.set("print_brand_name", "1")
    params.set("print_brand_name_size", String(values.brand_name_size))

    // Products data
    products.forEach((item, index) => {
      params.set(`products[${index}][product_id]`, String(item.product.id))
      params.set(`products[${index}][name]`, item.product.name)
      params.set(`products[${index}][code]`, item.product.code)
      params.set(`products[${index}][qty]`, String(item.quantity))
      params.set(`products[${index}][price]`, String(item.product.price))
    })

    // Open in new window for printing
    // router.push(`/products/print-barcode/preview?${params.toString()}`)
    // Instead of router.push
window.open(`/products/print-barcode/preview?${params.toString()}`, '_blank')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button type="button" variant="ghost" size="icon" onClick={() => router.push("/products")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Print Barcode</h1>
          <p className="text-muted-foreground mt-1 text-sm italic">Select products and generate barcode labels</p>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Product Search */}
          <div className="space-y-4">
            <label className="text-sm font-medium">
              Add Products <span className="text-red-500">*</span>
            </label>
            <MultipleProductSearchCombobox
              selectedProducts={selectedProducts}
              onProductsChange={handleProductsChange}
              placeholder="Search and select products..."
              warehouseId={null}
            />

            {/* Display Selected Products */}
            {selectedProducts.length > 0 && (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Image</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead className="w-32">Quantity</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((item) => {
                      const firstImage = item.product.image?.split(",")[0]?.trim()
                      const imageUrl = firstImage ? firstImage : null
                      const initials = item.product.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)

                      return (
                        <TableRow key={`${item.product.id}-${item.product.variant_id || 0}`}>
                          <TableCell>
                            {imageUrl ? (
                              <Image
                                src={imageUrl || "/placeholder.svg"}
                                alt={item.product.name}
                                width={40}
                                height={40}
                                className="aspect-square object-cover rounded"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-muted flex items-center justify-center rounded">
                                <span className="text-xs font-semibold text-muted-foreground">{initials}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{item.product.name}</TableCell>
                          <TableCell className="text-muted-foreground">{item.product.code}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(
                                  item.product.id,
                                  item.product.variant_id,
                                  Number.parseInt(e.target.value) || 1,
                                )
                              }
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const updated = selectedProducts.filter(
                                  (p) => !(p.id === item.product.id && p.variant_id === item.product.variant_id),
                                )
                                handleProductsChange(updated)
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            <h3 className="text-base font-semibold mb-4">
              Information on Label <span className="text-red-500">*</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Product Name */}
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="print_name"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0 font-semibold">Product Name</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Size</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 15)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="print_price"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0 font-semibold">Price</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Size</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 15)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Promotional Price */}
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="print_promo_price"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0 font-semibold">Promotional Price</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="promo_price_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Size</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 15)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Business Name */}
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="print_business_name"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0 font-semibold">Business Name</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="business_name_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Size</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 15)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Brand Name */}
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="print_brand_name"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0 font-semibold">Brand Name</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brand_name_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Size</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 15)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <FormField
              control={form.control}
              name="barcode_setting_id"
              render={({ field }) => (
                <FormItem className="max-w-md">
                  <FormLabel>
                    Paper Size <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <BarcodeSettingsCombobox
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select barcode setting..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={products.length === 0}>
              <Printer className="mr-2 h-4 w-4" />
              Generate Barcode Labels
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
