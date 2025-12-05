"use client"

import { useState } from "react"
import type { Table } from "@tanstack/react-table"
import { Trash2, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { DataTableBulkActions as BulkActionsToolbar } from "@/components/data-table/bulk-actions"
import { UnitsMultiDeleteDialog } from "./units-multi-delete-dialog"
import { PermissionGate } from "@/components/permission-gate"
import { ExportDialog, type ExportColumn } from "@/components/ui/export-dialog"
import { exportUnits } from "../data/units"
import { toast } from "sonner"

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

const exportColumns: ExportColumn[] = [
  { id: "unit_code", label: "Unit Code" },
  { id: "unit_name", label: "Unit Name" },
  { id: "base_unit", label: "Base Unit" },
  { id: "operator", label: "Operator" },
  { id: "operation_value", label: "Operation Value" },
]

export function DataTableBulkActions<TData>({ table }: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleExport = async (exportData: any) => {
    setIsExporting(true)
    try {
      const filters = {}

      await exportUnits({
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
      <TooltipProvider>
        <BulkActionsToolbar table={table} entityName="unit">
          <PermissionGate action="units:view">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowExportDialog(true)}
                  className="size-8"
                  aria-label="Export selected units"
                  title="Export selected units"
                >
                  <FileDown />
                  <span className="sr-only">Export selected units</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export selected units</p>
              </TooltipContent>
            </Tooltip>
          </PermissionGate>

          <PermissionGate action="units:delete">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="size-8"
                  aria-label="Delete selected units"
                  title="Delete selected units"
                >
                  <Trash2 />
                  <span className="sr-only">Delete selected units</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete selected units</p>
              </TooltipContent>
            </Tooltip>
          </PermissionGate>
        </BulkActionsToolbar>
      </TooltipProvider>

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        title="Export Units"
        description="Select columns and export options for the selected units"
        columns={exportColumns}
        onExport={handleExport}
        isExporting={isExporting}
      />

      <UnitsMultiDeleteDialog table={table} open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm} />
    </>
  )
}
