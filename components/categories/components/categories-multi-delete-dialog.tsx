"use client"

import { useState } from "react"
import { type Table } from "@tanstack/react-table"
import { AlertTriangle } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { type Category } from "../data/schema"
import { bulkDeleteCategories } from "../data/categories"

type CategoryMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

const CONFIRM_WORD = "DELETE"

export function CategoriesMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: CategoryMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState("")
  const queryClient = useQueryClient()

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = async () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`)
      return
    }

    try {
      const selectedCategories = selectedRows.map(
        (row) => row.original as Category
      )
      const ids = selectedCategories.map((cat) => cat.id)

      await bulkDeleteCategories(ids)
      toast.success(
        `Deleted ${selectedRows.length} ${
          selectedRows.length > 1 ? "categories" : "category"
        }`
      )
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      table.resetRowSelection()
      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete categories"
      )
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD}
      title={
        <span className="text-destructive">
          <AlertTriangle
            className="stroke-destructive me-1 inline-block"
            size={18}
          />{" "}
          Delete {selectedRows.length}{" "}
          {selectedRows.length > 1 ? "categories" : "category"}
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Are you sure you want to delete the selected categories? <br />
            This action cannot be undone.
          </p>

          <Label className="my-4 flex flex-col items-start gap-1.5">
            <span className="">Confirm by typing "{CONFIRM_WORD}":</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
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



