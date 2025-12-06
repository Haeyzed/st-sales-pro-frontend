"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DataTableColumnHeader } from "@/components/data-table"
import { LongText } from "@/components/long-text"
import { productStatuses } from "../data/data"
import { type Product } from "../data/schema"
import { DataTableRowActions } from "./data-table-row-actions"
import { formatCurrency } from "@/lib/utils"
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom"

export const productsColumns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
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
    accessorKey: "image",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Image" />
    ),
    cell: ({ row }) => {
      const imageString = row.original.image
      const name = row.original.name
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

      // Extract first image from comma-separated list
      let imageUrl = null
      if (imageString && imageString !== 'zummXD2dvAtI.png') {
        const firstImage = imageString.split(',')[0]?.trim()
        if (firstImage) {
          imageUrl = firstImage
        }
      }

      return (
        <Avatar className="h-10 w-10 rounded-md">
          {imageUrl ? (
            <ImageZoom zoomMargin={100}>
              <AvatarImage src={imageUrl} alt={name} className="object-cover"/>
            </ImageZoom>
          ) : null}
          <AvatarFallback className="bg-muted text-muted-foreground rounded-md">
            {initials}
          </AvatarFallback>
        </Avatar>
      )
    },
    meta: { className: "w-20" },
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <LongText className="max-w-36 ps-3">{row.getValue("name")}</LongText>
    ),
    meta: {
      className: cn(
        "drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]",
        "ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none"
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code" />
    ),
    cell: ({ row }) => {
      const code = row.getValue("code") as string
      return <div className="w-fit ps-2 text-nowrap font-mono text-sm">{code}</div>
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <Badge variant="outline" className="capitalize">
          {type}
        </Badge>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const category = row.original.category
      return category ? (
        <LongText className="max-w-36">{category.name}</LongText>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "brand",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Brand" />
    ),
    cell: ({ row }) => {
      const brand = row.original.brand
      return brand ? (
        <LongText className="max-w-36">{brand.title}</LongText>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      const price = row.getValue("price") as number
      return <div className="text-right font-medium">{formatCurrency(price)}</div>
    },
  },
  {
    accessorKey: "cost",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cost" />
    ),
    cell: ({ row }) => {
      const cost = row.getValue("cost") as number
      return <div className="text-right text-muted-foreground">{formatCurrency(cost)}</div>
    },
  },
  {
    accessorKey: "stock_worth",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock Worth (Price/Cost)" />
    ),
    cell: ({ row }) => {
      const stockWorth = row.getValue("stock_worth") as string
      const [priceWorth, costWorth] = stockWorth.split(' / ')
      return (
        <div className="text-right text-sm">
          <div className="font-medium">{formatCurrency(parseFloat(priceWorth))}</div>
          <div className="text-muted-foreground text-xs">{formatCurrency(parseFloat(costWorth))}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "qty",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock" />
    ),
    cell: ({ row }) => {
      const qty = row.getValue("qty") as number | null
      const alertQty = row.original.alert_quantity
      
      if (qty === null) {
        return <span className="text-muted-foreground">—</span>
      }

      const isLowStock = alertQty !== null && qty <= alertQty
      
      return (
        <div className={cn(
          "text-right font-medium",
          isLowStock && "text-orange-600 dark:text-orange-400"
        )}>
          {qty}
        </div>
      )
    },
  },
  {
    accessorKey: "is_active",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean
      const status = isActive ? "active" : "inactive"
      const statusConfig = productStatuses.find((s) => s.value === status)

      return (
        <div className="flex space-x-2">
          <Badge
            variant="outline"
            className={cn(
              "capitalize",
              isActive
                ? "bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200"
                : "bg-neutral-300/40 border-neutral-300"
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
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
    cell: DataTableRowActions,
  },
]

