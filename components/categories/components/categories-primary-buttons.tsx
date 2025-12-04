"use client"

import { Upload, FolderPlus, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCategories } from "../categories-provider"
import { PermissionGate } from "@/components/permission-gate"
import { ExportDialog } from "@/components/ui/export-dialog"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { getUsers } from "@/lib/api/users"
import type { EmailUser } from "@/components/ui/email-tag-input"

export function CategoriesPrimaryButtons() {
  const { setOpen } = useCategories()
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
      const { exportCategories } = await import("../data/categories")
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

  const exportableColumns = [
    { id: "name", label: "Name" },
    { id: "code", label: "Code" },
    { id: "parent", label: "Parent Category" },
    { id: "created_at", label: "Created At" },
  ]

  return (
    <TooltipProvider>
      <div className="flex gap-2">
        <PermissionGate action="categories:view">
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
            <TooltipContent>Export Categories</TooltipContent>
          </Tooltip>
        </PermissionGate>
        <PermissionGate action="categories:create">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="space-x-1"
                onClick={() => setOpen("import")}
              >
                <Upload size={18} />
                <span className="hidden sm:inline">Import</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Import Categories</TooltipContent>
          </Tooltip>
        </PermissionGate>
        <PermissionGate action="categories:create">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="space-x-1" onClick={() => setOpen("add")}>
                <FolderPlus size={18} />
                <span className="hidden sm:inline">Add Category</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add New Category</TooltipContent>
          </Tooltip>
        </PermissionGate>
      </div>

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        title="Export Categories"
        description="Select columns and configure export options for categories"
        columns={exportableColumns}
        users={users}
        onExport={handleExport}
        isExporting={isExporting}
        loadingUsers={loadingUsers}
      />
    </TooltipProvider>
  )
}



