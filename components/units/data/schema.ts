import { z } from "zod"

const unitSchemaBase = z.object({
  id: z.number(),
  unit_code: z.string(),
  unit_name: z.string(),

  base_unit: z.number().nullable().optional(),
  operator: z.enum(["*", "/"]).nullable().optional(),
  operation_value: z.number().nullable().optional(),
  is_active: z.boolean().nullable().optional(),

  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
})

export const unitSchema: z.ZodType<any> = unitSchemaBase.extend({
  base_unit_relation: z.lazy(() => unitSchema.nullable()).optional(),
  derived_units: z.array(z.lazy(() => unitSchema)).optional(),
})

export type Unit = z.infer<typeof unitSchema>

export const unitListSchema = z.array(unitSchema)
