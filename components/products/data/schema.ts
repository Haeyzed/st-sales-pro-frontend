import { z } from "zod"

const productSchemaBase = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  type: z.enum(["standard", "combo", "digital", "service"]),
  barcode_symbology: z.string(),
  slug: z.string().nullable(),
  brand_id: z.number().nullable(),
  category_id: z.number(),
  unit_id: z.number(),
  purchase_unit_id: z.number().nullable(),
  sale_unit_id: z.number().nullable(),
  cost: z.number(),
  price: z.number(),
  profit_margin: z.number(),
  wholesale_price: z.number().nullable(),
  qty: z.number().nullable(),
  stock_worth: z.string(),
  alert_quantity: z.number().nullable(),
  daily_sale_objective: z.number().nullable(),
  promotion: z.boolean().nullable(),
  promotion_price: z.string().nullable(),
  starting_date: z.string().nullable(),
  last_date: z.string().nullable(),
  tax_id: z.number().nullable(),
  tax_method: z.enum(["exclusive", "inclusive"]).nullable(),
  image: z.string().nullable(),
  file: z.string().nullable(),
  is_embeded: z.boolean().nullable(),
  is_variant: z.boolean().nullable(),
  is_batch: z.boolean().nullable(),
  is_diffPrice: z.boolean().nullable(),
  is_imei: z.boolean().nullable(),
  featured: z.boolean().nullable(),
  product_list: z.string().nullable(),
  variant_list: z.string().nullable(),
  qty_list: z.string().nullable(),
  price_list: z.string().nullable(),
  product_details: z.string().nullable(),
  variant_option: z.string().nullable(),
  variant_value: z.string().nullable(),
  short_description: z.string().nullable(),
  specification: z.string().nullable(),
  warranty: z.number().nullable(),
  warranty_type: z.string().nullable(),
  guarantee: z.number().nullable(),
  guarantee_type: z.string().nullable(),
  wastage_percent: z.union([z.number(), z.string()]).nullable(),
  combo_unit_id: z.union([z.number(), z.string()]).nullable(),
  production_cost: z.union([z.number(), z.string()]).nullable(),
  is_recipe: z.union([z.boolean(), z.number()]).nullable(),
  related_products: z.string().nullable(),
  tags: z.string().nullable(),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  is_sync_disable: z.boolean().nullable(),
  is_online: z.boolean().nullable(),
  in_stock: z.boolean().nullable(),
  track_inventory: z.boolean().nullable(),
  is_addon: z.boolean().nullable(),
  extras: z.string().nullable(),
  kitchen_id: z.number().nullable(),
  menu_type: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const productSchema: z.ZodType<
  z.infer<typeof productSchemaBase> & {
    category?: { id: number; name: string } | null
    brand?: { id: number; title: string } | null
    unit?: { id: number; unit_name: string } | null
    tax?: { id: number; name: string; rate: number } | null
    warehouse_prices?: Array<{ warehouse_id: number; price: number | null; warehouse_name: string | null }> | null
    warehouse_stock?: Array<{ warehouse_id: number; qty: number; warehouse_name: string | null }> | null
    variants?: Array<{ id: number | null; variant_id: number; item_code: string | null; additional_cost: number; additional_price: number; qty: number; position: number | null; name: string | null }> | null
    product_variants?: Array<{ id: number; variant_id: number; item_code: string | null; additional_cost: number; additional_price: number; qty: number; position: number | null }> | null
  }
> = productSchemaBase.extend({
  category: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .nullable()
    .optional(),
  brand: z
    .object({
      id: z.number(),
      title: z.string(),
    })
    .nullable()
    .optional(),
  unit: z
    .object({
      id: z.number(),
      unit_name: z.string(),
    })
    .nullable()
    .optional(),
  tax: z
    .object({
      id: z.number(),
      name: z.string(),
      rate: z.number(),
    })
    .nullable()
    .optional(),
  warehouse_prices: z
    .array(
      z.object({
        warehouse_id: z.number(),
        price: z.number().nullable(),
        warehouse_name: z.string().nullable(),
      })
    )
    .nullable()
    .optional(),
  warehouse_stock: z
    .array(
      z.object({
        warehouse_id: z.number(),
        qty: z.number(),
        warehouse_name: z.string().nullable(),
      })
    )
    .nullable()
    .optional(),
  variants: z
    .array(
      z.object({
        id: z.number().nullable(),
        variant_id: z.number(),
        item_code: z.string().nullable(),
        additional_cost: z.number(),
        additional_price: z.number(),
        qty: z.number(),
        position: z.number().nullable(),
        name: z.string().nullable(),
      })
    )
    .nullable()
    .optional(),
  product_variants: z
    .array(
      z.object({
        id: z.number(),
        variant_id: z.number(),
        item_code: z.string().nullable(),
        additional_cost: z.number(),
        additional_price: z.number(),
        qty: z.number(),
        position: z.number().nullable(),
      })
    )
    .nullable()
    .optional(),
})

export type Product = z.infer<typeof productSchema>

export const productListSchema = z.array(productSchema)

