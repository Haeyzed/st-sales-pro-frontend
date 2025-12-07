import { z } from "zod"

const categorySchemaBase = z.object({
  id: z.number(),
  name: z.string(),
  image: z.string().nullable(),
  image_url: z.string().nullable(),
  parent_id: z.number().nullable(),
  is_active: z.boolean(),
  is_sync_disable: z.boolean(),
  woocommerce_category_id: z.number().nullable(),
  slug: z.string().nullable(),
  featured: z.boolean().nullable(),
  page_title: z.string().nullable(),
  short_description: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const categorySchema: z.ZodType<
  z.infer<typeof categorySchemaBase> & {
    parent?: z.infer<typeof categorySchemaBase> | null
    children?: z.infer<typeof categorySchemaBase>[]
  }
> = categorySchemaBase.extend({
  parent: z.lazy(() => categorySchema.nullable()).optional(),
  children: z.array(z.lazy(() => categorySchema)).optional(),
})

export type Category = z.infer<typeof categorySchema>

export const categoryListSchema = z.array(categorySchema)

export const categoryDropdownSchema = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
    parent_id: z.number().nullable().optional(),
    image_url: z.string().nullable().optional(),
  }),
)

export type CategoryDropdownItem = z.infer<typeof categoryDropdownSchema>
