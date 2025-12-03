"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/data-table"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { type HistoryItem } from "./history-schema"

export const saleHistoryColumns: ColumnDef<HistoryItem>[] = [
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      return format(new Date(row.getValue("created_at")), "MMM dd, yyyy")
    },
  },
  {
    accessorKey: "reference_no",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reference" />
    ),
    cell: ({ row }) => {
      return (
        <span className="font-mono text-sm">{row.getValue("reference_no")}</span>
      )
    },
  },
  {
    accessorKey: "warehouse_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Warehouse" />
    ),
  },
  {
    accessorKey: "customer_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer" />
    ),
    cell: ({ row }) => {
      const customerName = row.getValue("customer_name") as string
      const customerPhone = row.original.customer_phone
      return (
        <div>
          {customerName}
          {customerPhone && (
            <span className="text-muted-foreground text-xs ml-1">
              [{customerPhone}]
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "qty",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Qty" className="justify-end" />
    ),
    cell: ({ row }) => {
      const qty = row.getValue("qty") as number
      return <div className="text-right">{qty.toFixed(2)}</div>
    },
    meta: {
      className: "text-right",
    },
  },
  {
    id: "unit_price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Unit Price" className="justify-end" />
    ),
    cell: ({ row }) => {
      const total = row.original.total
      const qty = row.original.qty
      const unitPrice = total / qty
      return <div className="text-right">{formatCurrency(unitPrice)}</div>
    },
    meta: {
      className: "text-right",
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Subtotal" className="justify-end" />
    ),
    cell: ({ row }) => {
      const total = row.getValue("total") as number
      return <div className="text-right font-medium">{formatCurrency(total)}</div>
    },
    meta: {
      className: "text-right",
    },
  },
]

