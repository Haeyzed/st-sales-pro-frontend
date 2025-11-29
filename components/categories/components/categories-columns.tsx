"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DataTableColumnHeader } from "@/components/data-table"
import { LongText } from "@/components/long-text"
import { categoryStatuses } from "../data/data"
import { type Category } from "../data/schema"
import { DataTableRowActions } from "./data-table-row-actions"

export const categoriesColumns: ColumnDef<Category>[] = [
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
      const image = row.original.image
      const name = row.original.name
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

      return (
        <Avatar className="h-10 w-10 rounded-md">
          {image ? (
            <AvatarImage src={image} alt={name} className="object-cover" />
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
    accessorKey: "parent_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Parent" />
    ),
    cell: ({ row }) => {
      const parent = row.original.parent
      return parent ? (
        <LongText className="max-w-36">{parent.name}</LongText>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    },
    meta: { className: "w-36" },
    enableSorting: false,
  },
  {
    accessorKey: "slug",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Slug" />
    ),
    cell: ({ row }) => {
      const slug = row.getValue("slug") as string | null
      return slug ? (
        <div className="w-fit ps-2 text-nowrap">{slug}</div>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "is_active",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean
      const status = isActive ? "active" : "inactive"
      const statusConfig = categoryStatuses.find((s) => s.value === status)

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
    accessorKey: "featured",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Featured" />
    ),
    cell: ({ row }) => {
      const featured = row.getValue("featured") as boolean | null
      return featured ? (
        <Badge variant="outline" className="bg-yellow-100/30 text-yellow-900 dark:text-yellow-200 border-yellow-200">
          Yes
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-neutral-300/40 border-neutral-300">
          No
        </Badge>
      )
    },
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
    cell: DataTableRowActions,
  },
]



