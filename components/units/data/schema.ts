import { z } from "zod"

const unitSchemaBase = z.object({
  id: z.number(),
  unit_code: z.string(),
  unit_name: z.string(),
  base_unit: z.number().nullable(),
  operator: z.enum(["*", "/"]).nullable(),
  operation_value: z.number().nullable(),
  is_active: z.boolean().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const unitSchema: z.ZodType<
  z.infer<typeof unitSchemaBase> & {
    base_unit_relation?: z.infer<typeof unitSchemaBase> | null
    derived_units?: z.infer<typeof unitSchemaBase>[]
  }
> = unitSchemaBase.extend({
  base_unit_relation: z.lazy(() => unitSchema.nullable()).optional(),
  derived_units: z.array(z.lazy(() => unitSchema)).optional(),
})

export type Unit = z.infer<typeof unitSchema>

export const unitListSchema = z.array(unitSchema)
