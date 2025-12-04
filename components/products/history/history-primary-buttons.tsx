"use client"

import { FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/permission-gate"
import { ExportDialog, type ExportColumn } from "@/components/ui/export-dialog"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { exportProductHistory, type ProductHistoryFilters } from "@/components/products/data/products"
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

interface HistoryPrimaryButtonsProps {
  productId: number
  historyType: "sales" | "purchases" | "sale-returns" | "purchase-returns"
  filters: ProductHistoryFilters
}

export function HistoryPrimaryButtons({
  productId,
  historyType,
  filters,
}: HistoryPrimaryButtonsProps) {
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

  const historyTypeLabel = 
    historyType === "sales" ? "Sales" :
    historyType === "purchases" ? "Purchases" :
    historyType === "sale-returns" ? "Sale Returns" :
    "Purchase Returns"

  return (
    <TooltipProvider>
      <div className="flex gap-2">
        <PermissionGate action="products:view">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="space-x-1"
                onClick={() => setShowExportDialog(true)}
              >
                <FileDown size={18} />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export {historyTypeLabel} History</TooltipContent>
          </Tooltip>
        </PermissionGate>
      </div>

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        title={`Export ${historyTypeLabel} History`}
        description="Select columns and configure export options for history records"
        columns={exportColumns}
        users={users}
        onExport={handleExport}
        isExporting={isExporting}
        loadingUsers={loadingUsers}
      />
    </TooltipProvider>
  )
}

