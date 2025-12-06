"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DataTableColumnHeader } from "@/components/data-table"
import { LongText } from "@/components/long-text"
import { brandStatuses } from "../data/data"
import { type Brand } from "../data/schema"
import { DataTableRowActions } from "./data-table-row-actions"
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom"

export const brandsColumns: ColumnDef<Brand>[] = [
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
      const title = row.original.title
      const initials = title
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

      return (
          <Avatar className="h-10 w-10 rounded-md">
            {image ? (
            <ImageZoom  zoomMargin={100}>
              <AvatarImage src={image} alt={title} className="object-cover" />
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
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => (
      <LongText className="max-w-36 ps-3">{row.getValue("title")}</LongText>
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
    accessorKey: "is_active",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean
      const status = isActive ? "active" : "inactive"
      const statusConfig = brandStatuses.find((s) => s.value === status)

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
      const createdAt = row.getValue("created_at") as string | null
      
      if (!createdAt) {
        return <span className="text-muted-foreground">—</span>
      }

      const date = new Date(createdAt)
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

