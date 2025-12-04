"use client"

import { useState, useEffect } from "react"
import { type Table } from "@tanstack/react-table"
import { FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DataTableBulkActions as BulkActionsToolbar } from "@/components/data-table/bulk-actions"
import { PermissionGate } from "@/components/permission-gate"
import { ExportDialog, type ExportColumn } from "@/components/ui/export-dialog"
import { exportProductHistory, type ProductHistoryFilters } from "@/components/products/data/products"
import { toast } from "sonner"
import { getUsers } from "@/lib/api/users"
import type { EmailUser } from "@/components/ui/email-tag-input"

const saleExportColumns: ExportColumn[] = [
  { id: "reference_no", label: "Reference" },
  { id: "created_at", label: "Date" },
  { id: "customer_name", label: "Customer" },
  { id: "customer_phone", label: "Phone" },
  { id: "warehouse_name", label: "Warehouse" },
  { id: "qty", label: "Quantity" },
  { id: "total", label: "Total" },
]

const purchaseExportColumns: ExportColumn[] = [
  { id: "reference_no", label: "Reference" },
  { id: "created_at", label: "Date" },
  { id: "supplier_name", label: "Supplier" },
  { id: "supplier_phone", label: "Phone" },
  { id: "warehouse_name", label: "Warehouse" },
  { id: "qty", label: "Quantity" },
  { id: "total", label: "Total" },
]

type HistoryBulkActionsProps<TData> = {
  table: Table<TData>
  productId: number
  historyType: "sales" | "purchases" | "sale-returns" | "purchase-returns"
  filters: ProductHistoryFilters
}

export function HistoryBulkActions<TData>({
  table,
  productId,
  historyType,
  filters,
}: HistoryBulkActionsProps<TData>) {
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [users, setUsers] = useState<EmailUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  const exportColumns =
    historyType === "sales" || historyType === "sale-returns"
      ? saleExportColumns
      : purchaseExportColumns

  // Fetch users when export dialog opens
  useEffect(() => {
    if (showExportDialog && users.length === 0) {
      setLoadingUsers(true)
      getUsers()
        .then(setUsers)
        .finally(() => setLoadingUsers(false))
    }
  }, [showExportDialog, users.length])

  const handleExport = async (exportData: any) => {
    setIsExporting(true)
    try {
      await exportProductHistory(productId, {
        columns: exportData.columns,
        export_type: exportData.exportType,
        export_method: exportData.exportMethod,
        emails: exportData.emails,
        schedule_at: exportData.scheduleAt ? exportData.scheduleAt.toISOString() : null,
        history_type: historyType,
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
      <BulkActionsToolbar table={table} entityName="record">
        <PermissionGate action="products:view">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowExportDialog(true)}
                className="size-8"
                aria-label="Export selected records"
                title="Export selected records"
              >
                <FileDown />
                <span className="sr-only">Export selected records</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export selected records</p>
            </TooltipContent>
          </Tooltip>
        </PermissionGate>
      </BulkActionsToolbar>

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        title={`Export ${historyType === "sales" ? "Sales" : historyType === "purchases" ? "Purchases" : historyType === "sale-returns" ? "Sale Returns" : "Purchase Returns"} History`}
        description="Select columns and export options for the selected records"
        columns={exportColumns}
        users={users}
        onExport={handleExport}
        isExporting={isExporting}
        loadingUsers={loadingUsers}
      />
    </>
  )
}

