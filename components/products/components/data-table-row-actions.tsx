"use client"

import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { type Row } from "@tanstack/react-table"
import { Trash2, FolderPen, Eye, History, Barcode } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type Product } from "../data/schema"
import { useProducts } from "../products-provider"
import { canPerformAction } from "@/lib/permissions"

type DataTableRowActionsProps = {
  row: Row<Product>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useProducts()
  const { data: session } = useSession()
  const router = useRouter()

  const canView = canPerformAction(session, "products:view")
  const canUpdate = canPerformAction(session, "products:update")
  const canDelete = canPerformAction(session, "products:delete")

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {canView && (
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen("view")
            }}
          >
            View
            <DropdownMenuShortcut>
              <Eye size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        {canUpdate && (
          <DropdownMenuItem
            onClick={() => {
              router.push(`/products/${row.original.id}/edit`)
            }}
          >
            Edit
            <DropdownMenuShortcut>
              <FolderPen size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        {canView && (
          <DropdownMenuItem
            onClick={() => {
              router.push(`/products/${row.original.id}/history`)
            }}
          >
            History
            <DropdownMenuShortcut>
              <History size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        {canView && (
          <DropdownMenuItem
            onClick={() => {
              router.push(`/products/print-barcode?product=${row.original.code} (${row.original.name})`)
            }}
          >
            Print Barcode
            <DropdownMenuShortcut>
              <Barcode size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        {(canUpdate || canView) && canDelete && <DropdownMenuSeparator />}
        {canDelete && (
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen("delete")
            }}
            className="text-red-500"
          >
            Delete
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

