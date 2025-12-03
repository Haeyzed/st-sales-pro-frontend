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
import { type Product } from "../data/schema"
import { ProductsMultiDeleteDialog } from "./products-multi-delete-dialog"
import { PermissionGate } from "@/components/permission-gate"
import { ExportDialog, type ExportColumn } from "@/components/ui/export-dialog"
import { exportProducts } from "../data/products"
import { toast } from "sonner"

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

const exportColumns: ExportColumn[] = [
  { id: "name", label: "Product Name" },
  { id: "code", label: "Product Code" },
  { id: "type", label: "Type" },
  { id: "barcode_symbology", label: "Barcode Symbology" },
  { id: "category", label: "Category" },
  { id: "brand", label: "Brand" },
  { id: "unit", label: "Unit" },
  { id: "cost", label: "Cost" },
  { id: "price", label: "Price" },
  { id: "qty", label: "Quantity" },
  { id: "alert_quantity", label: "Alert Quantity" },
  { id: "tax", label: "Tax" },
  { id: "tax_method", label: "Tax Method" },
  { id: "product_details", label: "Details" },
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

      await exportProducts({
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
      <BulkActionsToolbar table={table} entityName="product">
        <PermissionGate action="products:view">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowExportDialog(true)}
                className="size-8"
                aria-label="Export selected products"
                title="Export selected products"
              >
                <FileDown />
                <span className="sr-only">Export selected products</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export selected products</p>
            </TooltipContent>
          </Tooltip>
        </PermissionGate>

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

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        title="Export Products"
        description="Select columns and export options for the selected products"
        columns={exportColumns}
        onExport={handleExport}
        isExporting={isExporting}
      />

      <ProductsMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}

