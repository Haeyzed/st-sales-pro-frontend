"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { CategoryCombobox } from "./category-combobox"
import { BrandCombobox } from "./brand-combobox"
import { UnitCombobox } from "./unit-combobox"
import { TaxCombobox } from "./tax-combobox"
import { type Product } from "../data/schema"
import { createProduct, updateProduct } from "../data/products"

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
  is_batch: z.boolean().nullable().optional(),
  is_imei: z.boolean().nullable().optional(),
  is_embeded: z.boolean().nullable().optional(),
  is_diffPrice: z.boolean().nullable().optional(),
  variant_option: z.string().nullable().optional(),
  variant_value: z.string().nullable().optional(),
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
})

type ProductForm = z.infer<typeof formSchema>

type ProductActionDialogProps = {
  currentRow?: Product
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ProductActionForm({
  form,
  onSubmit,
  isDesktop,
  isEdit,
}: {
  form: ReturnType<typeof useForm<ProductForm>>
  onSubmit: (values: ProductForm) => void
  isDesktop: boolean
  isEdit: boolean
}) {
  const unitId = form.watch("unit_id")
  const productType = form.watch("type")
  const isVariant = form.watch("is_variant")
  const isBatch = form.watch("is_batch")
  const promotion = form.watch("promotion")

  return (
    <Form {...form}>
      <form
        id="product-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className={isDesktop ? "space-y-4 px-0.5" : "space-y-4"}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Name <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Product name"
                  className={isDesktop ? "col-span-4" : undefined}
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Code
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Product code/SKU (optional, auto-generated)"
                  className={isDesktop ? "col-span-4" : undefined}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="barcode_symbology"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Barcode Symbology
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value || "CODE128"}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className={isDesktop ? "col-span-4" : undefined}>
                    <SelectValue placeholder="Select barcode symbology" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CODE128">CODE128</SelectItem>
                    <SelectItem value="CODE39">CODE39</SelectItem>
                    <SelectItem value="UPC-A">UPC-A</SelectItem>
                    <SelectItem value="UPC-E">UPC-E</SelectItem>
                    <SelectItem value="EAN-8">EAN-8</SelectItem>
                    <SelectItem value="EAN-13">EAN-13</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Type <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className={isDesktop ? "col-span-4" : undefined}>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="combo">Combo</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Category <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <CategoryCombobox
                  value={field.value ?? null}
                  onValueChange={field.onChange}
                  placeholder="Select category"
                  className={isDesktop ? "col-span-4" : undefined}
                />
              </FormControl>
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="brand_id"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Brand
              </FormLabel>
              <FormControl>
                <BrandCombobox
                  value={field.value ?? null}
                  onValueChange={field.onChange}
                  placeholder="Select brand (optional)"
                  className={isDesktop ? "col-span-4" : undefined}
                />
              </FormControl>
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        {productType !== "digital" && productType !== "service" && (
          <>
            <FormField
              control={form.control}
              name="unit_id"
              render={({ field }) => (
                <FormItem
                  className={
                    isDesktop
                      ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                      : undefined
                  }
                >
                  <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                    Base Unit <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <UnitCombobox
                      value={field.value ?? null}
                      onValueChange={field.onChange}
                      placeholder="Select base unit"
                      className={isDesktop ? "col-span-4" : undefined}
                    />
                  </FormControl>
                  <FormMessage
                    className={isDesktop ? "col-span-4 col-start-3" : undefined}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchase_unit_id"
              render={({ field }) => (
                <FormItem
                  className={
                    isDesktop
                      ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                      : undefined
                  }
                >
                  <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                    Purchase Unit
                  </FormLabel>
                  <FormControl>
                    <UnitCombobox
                      value={field.value ?? null}
                      onValueChange={field.onChange}
                      placeholder="Select purchase unit (optional)"
                      className={isDesktop ? "col-span-4" : undefined}
                    />
                  </FormControl>
                  <FormMessage
                    className={isDesktop ? "col-span-4 col-start-3" : undefined}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sale_unit_id"
              render={({ field }) => (
                <FormItem
                  className={
                    isDesktop
                      ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                      : undefined
                  }
                >
                  <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                    Sale Unit
                  </FormLabel>
                  <FormControl>
                    <UnitCombobox
                      value={field.value ?? null}
                      onValueChange={field.onChange}
                      placeholder="Select sale unit (optional)"
                      className={isDesktop ? "col-span-4" : undefined}
                    />
                  </FormControl>
                  <FormMessage
                    className={isDesktop ? "col-span-4 col-start-3" : undefined}
                  />
                </FormItem>
              )}
            />
          </>
        )}
        {productType !== "digital" && productType !== "service" && (
          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem
                className={
                  isDesktop
                    ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                    : undefined
                }
              >
                <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                  Cost <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className={isDesktop ? "col-span-4" : undefined}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage
                  className={isDesktop ? "col-span-4 col-start-3" : undefined}
                />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Price <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className={isDesktop ? "col-span-4" : undefined}
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="wholesale_price"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Wholesale Price
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00 (optional)"
                  className={isDesktop ? "col-span-4" : undefined}
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                  }
                />
              </FormControl>
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        {productType !== "digital" && productType !== "service" && (
          <>
            <FormField
              control={form.control}
              name="profit_margin"
              render={({ field }) => (
                <FormItem
                  className={
                    isDesktop
                      ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                      : undefined
                  }
                >
                  <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                    Profit Margin (%)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="0.00 (optional)"
                      className={isDesktop ? "col-span-4" : undefined}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                      }
                    />
                  </FormControl>
                  <FormMessage
                    className={isDesktop ? "col-span-4 col-start-3" : undefined}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="daily_sale_objective"
              render={({ field }) => (
                <FormItem
                  className={
                    isDesktop
                      ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                      : undefined
                  }
                >
                  <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                    Daily Sale Objective
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00 (optional)"
                      className={isDesktop ? "col-span-4" : undefined}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                      }
                    />
                  </FormControl>
                  <FormMessage
                    className={isDesktop ? "col-span-4 col-start-3" : undefined}
                  />
                </FormItem>
              )}
            />
          </>
        )}
        <FormField
          control={form.control}
          name="tax_id"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Tax
              </FormLabel>
              <FormControl>
                <TaxCombobox
                  value={field.value ?? null}
                  onValueChange={field.onChange}
                  placeholder="Select tax (optional)"
                  className={isDesktop ? "col-span-4" : undefined}
                />
              </FormControl>
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tax_method"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Tax Method
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value?.toString()}
                  onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                >
                  <SelectTrigger className={isDesktop ? "col-span-4" : undefined}>
                    <SelectValue placeholder="Select tax method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Exclusive</SelectItem>
                    <SelectItem value="1">Inclusive</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="alert_quantity"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Alert Quantity
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Minimum stock alert (optional)"
                  className={isDesktop ? "col-span-4" : undefined}
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                  }
                />
              </FormControl>
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="promotion"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Add Promotional Price
              </FormLabel>
              <FormControl>
                <div className={isDesktop ? "col-span-4" : undefined}>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </div>
              </FormControl>
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        {promotion && (
          <>
            <FormField
              control={form.control}
              name="promotion_price"
              render={({ field }) => (
                <FormItem
                  className={
                    isDesktop
                      ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                      : undefined
                  }
                >
                  <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                    Promotional Price
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Promotional price"
                      className={isDesktop ? "col-span-4" : undefined}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage
                    className={isDesktop ? "col-span-4 col-start-3" : undefined}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="starting_date"
              render={({ field }) => (
                <FormItem
                  className={
                    isDesktop
                      ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                      : undefined
                  }
                >
                  <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                    Promotion Starts
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className={isDesktop ? "col-span-4" : undefined}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage
                    className={isDesktop ? "col-span-4 col-start-3" : undefined}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_date"
              render={({ field }) => (
                <FormItem
                  className={
                    isDesktop
                      ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                      : undefined
                  }
                >
                  <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                    Promotion Ends
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className={isDesktop ? "col-span-4" : undefined}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage
                    className={isDesktop ? "col-span-4 col-start-3" : undefined}
                  />
                </FormItem>
              )}
            />
          </>
        )}
        <FormField
          control={form.control}
          name="product_details"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Product Details
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Product description (optional)"
                  className={isDesktop ? "col-span-4" : undefined}
                  rows={4}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="short_description"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Short Description
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief product description (optional)"
                  className={isDesktop ? "col-span-4" : undefined}
                  rows={2}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="specification"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Specification
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Product specifications (optional)"
                  className={isDesktop ? "col-span-4" : undefined}
                  rows={3}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="warranty"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Warranty
              </FormLabel>
              <div className={isDesktop ? "col-span-4 flex gap-2" : "flex gap-2"}>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Warranty period"
                    className="flex-1"
                    {...field}
                    value={field.value ?? ""}
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
                        value={typeField.value || "days"}
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
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="guarantee"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Guarantee
              </FormLabel>
              <div className={isDesktop ? "col-span-4 flex gap-2" : "flex gap-2"}>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Guarantee period"
                    className="flex-1"
                    {...field}
                    value={field.value ?? ""}
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
                        value={typeField.value || "days"}
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
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_variant"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Has Variants
              </FormLabel>
              <FormControl>
                <div className={isDesktop ? "col-span-4" : undefined}>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </div>
              </FormControl>
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        {isVariant && (
          <>
            <FormField
              control={form.control}
              name="variant_option"
              render={({ field }) => (
                <FormItem
                  className={
                    isDesktop
                      ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                      : undefined
                  }
                >
                  <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                    Variant Option
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Size, Color (comma-separated)"
                      className={isDesktop ? "col-span-4" : undefined}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage
                    className={isDesktop ? "col-span-4 col-start-3" : undefined}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="variant_value"
              render={({ field }) => (
                <FormItem
                  className={
                    isDesktop
                      ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                      : undefined
                  }
                >
                  <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                    Variant Value
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Small,Medium,Large / Red,Blue,Green (pipe-separated for multiple options)"
                      className={isDesktop ? "col-span-4" : undefined}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage
                    className={isDesktop ? "col-span-4 col-start-3" : undefined}
                  />
                </FormItem>
              )}
            />
          </>
        )}
        <FormField
          control={form.control}
          name="is_batch"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Batch Tracking
              </FormLabel>
              <FormControl>
                <div className={isDesktop ? "col-span-4" : undefined}>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </div>
              </FormControl>
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_imei"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                IMEI Tracking
              </FormLabel>
              <FormControl>
                <div className={isDesktop ? "col-span-4" : undefined}>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </div>
              </FormControl>
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Featured
              </FormLabel>
              <FormControl>
                <div className={isDesktop ? "col-span-4" : undefined}>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </div>
              </FormControl>
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_embeded"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Embedded Barcode
              </FormLabel>
              <FormControl>
                <div className={isDesktop ? "col-span-4" : undefined}>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </div>
              </FormControl>
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_diffPrice"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Different Price Per Warehouse
              </FormLabel>
              <FormControl>
                <div className={isDesktop ? "col-span-4" : undefined}>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </div>
              </FormControl>
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        {form.watch("is_diffPrice") && (
          <div className={isDesktop ? "col-span-6 col-start-1" : ""}>
            <p className="text-sm text-muted-foreground mb-2">
              Note: Warehouse-specific pricing will be managed separately after product creation.
            </p>
          </div>
        )}
        <FormField
          control={form.control}
          name="image"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Image
              </FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  className={isDesktop ? "col-span-4" : undefined}
                  onChange={(e) => onChange(e.target.files?.[0] || null)}
                  {...field}
                />
              </FormControl>
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        {(productType === "digital" || productType === "service") && (
          <FormField
            control={form.control}
            name="file"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem
                className={
                  isDesktop
                    ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                    : undefined
                }
              >
                <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                  Attach File
                </FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept=".pdf,.zip,.rar,.doc,.docx"
                    className={isDesktop ? "col-span-4" : undefined}
                    onChange={(e) => onChange(e.target.files?.[0] || null)}
                    {...field}
                  />
                </FormControl>
                <FormMessage
                  className={isDesktop ? "col-span-4 col-start-3" : undefined}
                />
              </FormItem>
            )}
          />
        )}
      </form>
    </Form>
  )
}

export function ProductsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: ProductActionDialogProps) {
  const isEdit = !!currentRow
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const queryClient = useQueryClient()

  const form = useForm<ProductForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          code: currentRow.code,
          type: currentRow.type,
          barcode_symbology: currentRow.barcode_symbology || "CODE128",
          category_id: currentRow.category_id,
          unit_id: currentRow.unit_id,
          purchase_unit_id: currentRow.purchase_unit_id,
          sale_unit_id: currentRow.sale_unit_id,
          cost: currentRow.cost,
          price: currentRow.price,
          profit_margin: currentRow.profit_margin ?? null,
          wholesale_price: currentRow.wholesale_price,
          daily_sale_objective: currentRow.daily_sale_objective ?? null,
          brand_id: currentRow.brand_id,
          tax_id: currentRow.tax_id,
          tax_method: currentRow.tax_method,
          alert_quantity: currentRow.alert_quantity,
          promotion: currentRow.promotion ?? false,
          promotion_price: currentRow.promotion_price ?? null,
          starting_date: currentRow.starting_date ?? null,
          last_date: currentRow.last_date ?? null,
          product_details: currentRow.product_details,
          short_description: currentRow.short_description ?? null,
          specification: currentRow.specification ?? null,
          warranty: currentRow.warranty ?? null,
          warranty_type: currentRow.warranty_type ?? null,
          guarantee: currentRow.guarantee ?? null,
          guarantee_type: currentRow.guarantee_type ?? null,
          slug: currentRow.slug,
          tags: currentRow.tags ?? null,
          meta_title: currentRow.meta_title ?? null,
          meta_description: currentRow.meta_description ?? null,
          is_sync_disable: currentRow.is_sync_disable ?? false,
          is_online: currentRow.is_online ?? false,
          in_stock: currentRow.in_stock ?? null,
          track_inventory: currentRow.track_inventory ?? null,
          is_addon: currentRow.is_addon ?? null,
          extras: currentRow.extras ?? null,
          kitchen_id: currentRow.kitchen_id ?? null,
          menu_type: currentRow.menu_type ?? null,
          production_cost: currentRow.production_cost ?? null,
          is_recipe: currentRow.is_recipe ?? null,
          is_variant: currentRow.is_variant ?? false,
          variant_option: currentRow.variant_option ?? null,
          variant_value: currentRow.variant_value ?? null,
          is_batch: currentRow.is_batch ?? false,
          is_imei: currentRow.is_imei ?? false,
          is_embeded: currentRow.is_embeded ?? false,
          is_diffPrice: currentRow.is_diffPrice ?? false,
          diff_price: null, // Will be handled separately
          featured: currentRow.featured ?? false,
          image: null,
          file: null,
        }
      : {
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
          is_variant: false,
          variant_option: null,
          variant_value: null,
          is_batch: false,
          is_imei: false,
          is_embeded: false,
          is_diffPrice: false,
          diff_price: null,
          featured: false,
          image: null,
          file: null,
        },
  })

  const onSubmit = async (values: ProductForm) => {
    try {
      // Convert form values to FormData for file uploads
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
          if (values.variant_option) {
            // Convert comma-separated string to array if needed
            const options = values.variant_option.split(",").map((o) => o.trim())
            formData.append("variant_option", JSON.stringify(options))
          }
          if (values.variant_value) {
            // Convert pipe-separated string to array if needed
            const values_array = values.variant_value.split("|").map((v) => v.trim())
            formData.append("variant_value", JSON.stringify(values_array))
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
      if (values.is_addon !== null && values.is_addon !== undefined) {
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
      
      // File uploads
      if (values.image) formData.append("image", values.image)
      if (values.file) formData.append("file", values.file)
      
      let response
      if (isEdit && currentRow) {
        response = await updateProduct(currentRow.id, formData)
      } else {
        response = await createProduct(formData)
      }

      toast.success(
        response.message ||
          (isEdit ? "Product updated successfully" : "Product created successfully")
      )

      queryClient.invalidateQueries({ queryKey: ["products"] })
      form.reset()
      onOpenChange(false)
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
    }
  }

  const handleOpenChange = (state: boolean) => {
    form.reset()
    onOpenChange(state)
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="text-start">
            <DialogTitle>
              {isEdit ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              {isEdit ? "Update the product here. " : "Create new product here. "}
              Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-1 pe-3">
            <ProductActionForm
              form={form}
              onSubmit={onSubmit}
              isDesktop={isDesktop}
              isEdit={isEdit}
            />
          </div>
          <DialogFooter>
            <Button type="submit" form="product-form">
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>
            {isEdit ? "Edit Product" : "Add New Product"}
          </DrawerTitle>
          <DrawerDescription>
            {isEdit ? "Update the product here. " : "Create new product here. "}
            Click save when you&apos;re done.
          </DrawerDescription>
        </DrawerHeader>
        <div className="max-h-[60vh] overflow-y-auto px-4">
          <ProductActionForm
            form={form}
            onSubmit={onSubmit}
            isDesktop={isDesktop}
            isEdit={isEdit}
          />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button type="submit" form="product-form">
            Save changes
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

