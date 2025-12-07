import { z } from "zod"

export const brandSchema = z.object({
  id: z.number(),
  title: z.string(),
  image: z.string().nullable(),
  image_url: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
})

export type Brand = z.infer<typeof brandSchema>

export const brandListSchema = z.array(brandSchema)

export const brandDropdownSchema = z.array(
  z.object({
    id: z.number(),
    title: z.string(),
    image_url: z.string().nullable().optional(),
  }),
)

export type BrandDropdownItem = z.infer<typeof brandDropdownSchema>

