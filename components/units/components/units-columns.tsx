"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table"
import { unitStatuses } from "../data/data"
import type { Unit } from "../data/schema"
import { UnitsRowActions } from "./units-row-actions"

export const unitsColumns: ColumnDef<Unit>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    meta: {
      className: cn("max-md:sticky start-0 z-10 rounded-tl-[inherit]"),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "unit_code",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
    cell: ({ row }) => {
      return <div className="ps-3 font-medium max-w-36">{row.getValue("unit_code")}</div>
    },
    meta: {
      className: cn(
        "drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]",
        "ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none",
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: "unit_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      return <div className="max-w-36">{row.getValue("unit_name")}</div>
    },
    enableSorting: true,
  },
  {
    accessorKey: "base_unit",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Base Unit" />,
    cell: ({ row }) => {
      const unit = row.original
      if (unit.base_unit_relation) {
        return <div className="text-sm">{unit.base_unit_relation.unit_code}</div>
      }
      return <span className="text-muted-foreground">—</span>
    },
    enableSorting: false,
  },
  {
    accessorKey: "operator",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Operator" />,
    cell: ({ row }) => {
      const operator = row.getValue("operator") as string | null
      if (!operator) return <span className="text-muted-foreground">—</span>
      return <div className="font-mono text-sm">{operator}</div>
    },
    enableSorting: false,
  },
  {
    accessorKey: "operation_value",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Operation Value" />,
    cell: ({ row }) => {
      const value = row.getValue("operation_value") as number | null
      if (value === null || value === undefined) {
        return <span className="text-muted-foreground">—</span>
      }
      return <div className="text-sm">{value}</div>
    },
    enableSorting: false,
  },
  {
    accessorKey: "is_active",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean
      const status = isActive ? "active" : "inactive"
      const statusConfig = unitStatuses.find((s) => s.value === status)

      return (
        <div className="flex space-x-2">
          <Badge
            variant="outline"
            className={cn(
              "capitalize",
              isActive
                ? "bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200"
                : "bg-neutral-300/40 border-neutral-300",
            )}
          >
            {statusConfig?.label || status}
          </Badge>
        </div>
      )
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
      const diffInMinutes = Math.floor(diffInSeconds / 60)
      const diffInHours = Math.floor(diffInMinutes / 60)
      const diffInDays = Math.floor(diffInHours / 24)

      let friendlyDate: string

      if (diffInSeconds < 60) {
        friendlyDate = "Just now"
      } else if (diffInMinutes < 60) {
        friendlyDate = `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`
      } else if (diffInHours < 24) {
        friendlyDate = `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`
      } else if (diffInDays < 7) {
        friendlyDate = `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`
      } else if (diffInDays < 30) {
        const weeks = Math.floor(diffInDays / 7)
        friendlyDate = `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`
      } else if (diffInDays < 365) {
        const months = Math.floor(diffInDays / 30)
        friendlyDate = `${months} ${months === 1 ? "month" : "months"} ago`
      } else {
        // For dates older than a year, show formatted date
        friendlyDate = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      }

      return (
        <div className="text-sm" title={date.toLocaleString()}>
          {friendlyDate}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: UnitsRowActions,
  },
]
