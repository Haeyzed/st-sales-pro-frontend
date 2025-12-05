"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConfirmDialog } from "@/components/confirm-dialog"
import type { Unit } from "../data/schema"
import { deleteUnit } from "../data/units"

type UnitDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Unit
}

export function UnitsDeleteDialog({ open, onOpenChange, currentRow }: UnitDeleteDialogProps) {
  const [value, setValue] = useState("")
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.unit_code) return

    try {
      await deleteUnit(currentRow.id)
      toast.success("Unit deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["units"] })
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete unit")
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.unit_code}
      title={
        <span className="text-destructive">
          <AlertTriangle className="stroke-destructive me-1 inline-block" size={18} /> Delete Unit
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete{" "}
            <span className="font-bold">
              {currentRow.unit_code} - {currentRow.unit_name}
            </span>
            ?
            <br />
            This action will permanently remove the unit from the system. This cannot be undone.
          </p>

          <Label className="my-2">
            Unit Code:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter unit code to confirm deletion."
            />
          </Label>

          <Alert variant="destructive">
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>Please be careful, this operation can not be rolled back.</AlertDescription>
          </Alert>
        </div>
      }
      confirmText="Delete"
      destructive
    />
  )
}
