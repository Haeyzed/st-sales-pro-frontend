"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { type Category } from "../data/schema"
import { deleteCategory } from "../data/categories"

type CategoryDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Category
}

export function CategoriesDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: CategoryDeleteDialogProps) {
  const [value, setValue] = useState("")
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.name) return

    try {
      await deleteCategory(currentRow.id)
      toast.success("Category deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete category"
      )
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.name}
      title={
        <span className="text-destructive">
          <AlertTriangle
            className="stroke-destructive me-1 inline-block"
            size={18}
          />{" "}
          Delete Category
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete{" "}
            <span className="font-bold">{currentRow.name}</span>?
            <br />
            This action will permanently remove the category from the system.
            This cannot be undone.
          </p>

          <Label className="my-2">
            Category Name:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter category name to confirm deletion."
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



