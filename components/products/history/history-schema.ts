import { z } from "zod"

export const historyItemSchema = z.object({
  id: z.number(),
  reference_no: z.string(),
  warehouse_name: z.string(),
  customer_name: z.string().optional(),
  customer_phone: z.string().nullable().optional(),
  supplier_name: z.string().nullable().optional(),
  supplier_phone: z.string().nullable().optional(),
  qty: z.number(),
  total: z.number(),
  created_at: z.string(),
})

export type HistoryItem = z.infer<typeof historyItemSchema>

