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
import { type Brand } from "../data/schema"
import { BrandsMultiDeleteDialog } from "./brands-multi-delete-dialog"
import { PermissionGate } from "@/components/permission-gate"

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <>
      <BulkActionsToolbar table={table} entityName="brand">
        <PermissionGate action="brands:delete">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setShowDeleteConfirm(true)}
                className="size-8"
                aria-label="Delete selected brands"
                title="Delete selected brands"
              >
                <Trash2 />
                <span className="sr-only">Delete selected brands</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete selected brands</p>
            </TooltipContent>
          </Tooltip>
        </PermissionGate>
      </BulkActionsToolbar>

      <BrandsMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}

