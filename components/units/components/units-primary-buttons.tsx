"use client"

import { Upload, Zap, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useUnits } from "../units-provider"
import { PermissionGate } from "@/components/permission-gate"
import { ExportDialog } from "@/components/ui/export-dialog"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { getUsers } from "@/lib/api/users"
import type { EmailUser } from "@/components/ui/email-tag-input"
import { exportUnits } from "../data/units"

export function UnitsPrimaryButtons() {
  const { setOpen } = useUnits()
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [users, setUsers] = useState<EmailUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

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

  const exportableColumns = [
    { id: "unit_code", label: "Unit Code" },
    { id: "unit_name", label: "Unit Name" },
    { id: "base_unit", label: "Base Unit" },
    { id: "operator", label: "Operator" },
    { id: "operation_value", label: "Operation Value" },
    { id: "is_active", label: "Status" },
    { id: "created_at", label: "Created At" },
  ]

  return (
    <TooltipProvider>
      <div className="flex gap-2">
        <PermissionGate action="units:view">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="space-x-1 bg-transparent" onClick={() => setShowExportDialog(true)}>
                <FileDown size={18} />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export Units</TooltipContent>
          </Tooltip>
        </PermissionGate>
        <PermissionGate action="units:create">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="space-x-1 bg-transparent" onClick={() => setOpen("import")}>
                <Upload size={18} />
                <span className="hidden sm:inline">Import</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Import Units</TooltipContent>
          </Tooltip>
        </PermissionGate>
        <PermissionGate action="units:create">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="space-x-1" onClick={() => setOpen("add")}>
                <Zap size={18} />
                <span className="hidden sm:inline">Add Unit</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add New Unit</TooltipContent>
          </Tooltip>
        </PermissionGate>
      </div>

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        title="Export Units"
        description="Select columns and configure export options for units"
        columns={exportableColumns}
        users={users}
        onExport={handleExport}
        isExporting={isExporting}
        loadingUsers={loadingUsers}
      />
    </TooltipProvider>
  )
}
