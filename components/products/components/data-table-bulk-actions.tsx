"use client"

import { useState } from "react"
import { type Table } from "@tanstack/react-table"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DataTableBulkActions as BulkActionsToolbar } from "@/components/data-table/bulk-actions"
import { type Product } from "../data/schema"
import { ProductsMultiDeleteDialog } from "./products-multi-delete-dialog"
import { PermissionGate } from "@/components/permission-gate"

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  return (
    <>
      <BulkActionsToolbar table={table} entityName="product">
        <PermissionGate action="products:delete">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setShowDeleteConfirm(true)}
                className="size-8"
                aria-label="Delete selected products"
                title="Delete selected products"
              >
                <Trash2 />
                <span className="sr-only">Delete selected products</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete selected products</p>
            </TooltipContent>
          </Tooltip>
        </PermissionGate>
      </BulkActionsToolbar>

      <ProductsMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}

