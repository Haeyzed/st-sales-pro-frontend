"use client"

import { useState } from "react"
import { type Table } from "@tanstack/react-table"
import { Trash2, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DataTableBulkActions as BulkActionsToolbar } from "@/components/data-table/bulk-actions"
import { type Category } from "../data/schema"
import { CategoriesMultiDeleteDialog } from "./categories-multi-delete-dialog"
import { PermissionGate } from "@/components/permission-gate"
import { ExportDialog, type ExportColumn } from "@/components/ui/export-dialog"
import { exportCategories } from "../data/categories"
import { toast } from "sonner"
import { users } from "@/components/users/data/users"
import { EmailUser } from "@/components/ui/email-tag-input"

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

const exportColumns: ExportColumn[] = [
  { id: "name", label: "Category Name" },
  { id: "code", label: "Category Code" },
  { id: "parent_category", label: "Parent Category" },
  { id: "description", label: "Description" },
]

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleExport = async (exportData: any) => {
    setIsExporting(true)
    try {
      const filters = {}

      await exportCategories({
        columns: exportData.columns,
        export_type: exportData.exportType,
        export_method: exportData.exportMethod,
        emails: exportData.emails,
        schedule_at: exportData.scheduleAt ? exportData.scheduleAt.toISOString() : null,
        filters,
      })

      if (exportData.exportMethod === "email") {
        if (exportData.scheduleEmail) {
          toast.success("Export scheduled successfully")
        } else {
          toast.success("Export sent to email successfully")
        }
      } else {
        toast.success("Export downloaded successfully")
      }
      
      setShowExportDialog(false)
    } catch (error: any) {
      toast.error(error?.message || "Export failed")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName="category">
        <PermissionGate action="categories:view">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowExportDialog(true)}
                className="size-8"
                aria-label="Export selected categories"
                title="Export selected categories"
              >
                <FileDown />
                <span className="sr-only">Export selected categories</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export selected categories</p>
            </TooltipContent>
          </Tooltip>
        </PermissionGate>

        <PermissionGate action="categories:delete">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setShowDeleteConfirm(true)}
                className="size-8"
                aria-label="Delete selected categories"
                title="Delete selected categories"
              >
                <Trash2 />
                <span className="sr-only">Delete selected categories</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete selected categories</p>
            </TooltipContent>
          </Tooltip>
        </PermissionGate>
      </BulkActionsToolbar>

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        title="Export Categories"
        description="Select columns and export options for the selected categories"
        columns={exportColumns}
        onExport={handleExport}
        isExporting={isExporting}
        // users={users.map((user: any) => ({
        //     name: `${user.firstName} ${user.lastName}`,
        //     email: user.email,
        //   })) as EmailUser[],
        // }
      />

      <CategoriesMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}



