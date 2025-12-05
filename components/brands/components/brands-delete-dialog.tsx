"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { type Brand } from "../data/schema"
import { deleteBrand } from "../data/brands"

type BrandDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Brand
}

export function BrandsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: BrandDeleteDialogProps) {
  const [value, setValue] = useState("")
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.title) return

    try {
      await deleteBrand(currentRow.id)
      toast.success("Brand deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["brands"] })
      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete brand"
      )
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.title}
      title={
        <span className="text-destructive">
          <AlertTriangle
            className="stroke-destructive me-1 inline-block"
            size={18}
          />{" "}
          Delete Brand
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete{" "}
            <span className="font-bold">{currentRow.title}</span>?
            <br />
            This action will permanently remove the brand from the system.
            This cannot be undone.
          </p>

          <Label className="my-2">
            Brand Title:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter brand title to confirm deletion."
            />
          </Label>

          <Alert variant="destructive">
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation can not be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText="Delete"
      destructive
    />
  )
}

