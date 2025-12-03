"use client"

import { Upload, PackagePlus, Wifi, FileDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useProducts } from "../products-provider"
import { PermissionGate } from "@/components/permission-gate"
import { apiPostClient } from "@/lib/api-client-client"
import { toast } from "sonner"
import { useState } from "react"
import { Spinner } from "@/components/ui/spinner"
import { ExportDialog } from "@/components/ui/export-dialog"

export function ProductsPrimaryButtons() {
  const { setOpen } = useProducts()
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleShowAllOnline = async () => {
    try {
      setIsUpdating(true)
      const response = await apiPostClient("products/show-all-online")
      toast.success(response.message || "All products are now shown online")
      window.location.reload() // Reload to reflect changes
    } catch (error: any) {
      toast.error(error?.message || "Failed to update products")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleExport = async (exportData: any) => {
    setIsExporting(true)
    try {
      const { exportProducts } = await import("../data/products")
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

  const exportableColumns = [
    { id: "name", label: "Name" },
    { id: "code", label: "Code" },
    { id: "barcode", label: "Barcode" },
    { id: "category", label: "Category" },
    { id: "brand", label: "Brand" },
    { id: "unit", label: "Unit" },
    { id: "cost", label: "Cost" },
    { id: "price", label: "Price" },
    { id: "quantity", label: "Quantity" },
    { id: "alert_quantity", label: "Alert Quantity" },
    { id: "tax", label: "Tax" },
    { id: "tax_method", label: "Tax Method" },
    { id: "status", label: "Status" },
    { id: "created_at", label: "Created At" },
  ]
  
  return (
    <>
      <div className="flex gap-2">
        <PermissionGate action="products:update">
          <Button
            variant="secondary"
            className="space-x-1"
            onClick={handleShowAllOnline}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Spinner />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <span>Show All Online</span>
                <Wifi size={18} />
              </>
            )}
          </Button>
        </PermissionGate>
        <PermissionGate action="products:view">
          <Button
            variant="outline"
            className="space-x-1"
            onClick={() => setShowExportDialog(true)}
          >
            <span>Export</span> <FileDown size={18} />
          </Button>
        </PermissionGate>
        <PermissionGate action="products:create">
          <Button
            variant="outline"
            className="space-x-1"
            onClick={() => setOpen("import")}
          >
            <span>Import</span> <Upload size={18} />
          </Button>
        </PermissionGate>
        <PermissionGate action="products:create">
          <Button 
            className="space-x-1" 
            onClick={() => router.push("/products/create")}
          >
            <span>Add Product</span> <PackagePlus size={18} />
          </Button>
        </PermissionGate>
      </div>

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        columns={exportableColumns}
        onExport={handleExport}
        isExporting={isExporting}
      />
    </>
  )
}

