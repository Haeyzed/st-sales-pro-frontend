import { z } from "zod"

export const brandSchema = z.object({
  id: z.number(),
  title: z.string(),
  image: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
})

export type Brand = z.infer<typeof brandSchema>

export const brandListSchema = z.array(brandSchema)

