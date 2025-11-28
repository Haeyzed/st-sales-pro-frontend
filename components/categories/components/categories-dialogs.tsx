"use client"

import { CategoriesActionDialog } from "./categories-action-dialog"
import { CategoriesDeleteDialog } from "./categories-delete-dialog"
import { CategoriesImportDialog } from "./categories-import-dialog"
import { useCategories } from "../categories-provider"

export function CategoriesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useCategories()
  return (
    <>
      <CategoriesActionDialog
        key="category-add"
        open={open === "add"}
        onOpenChange={(state) => setOpen(state ? "add" : null)}
      />

      <CategoriesImportDialog
        key="category-import"
        open={open === "import"}
        onOpenChange={(state) => setOpen(state ? "import" : null)}
      />

      {currentRow && (
        <>
          <CategoriesActionDialog
            key={`category-edit-${currentRow.id}`}
            open={open === "edit"}
            onOpenChange={(state) => {
              setOpen(state ? "edit" : null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <CategoriesDeleteDialog
            key={`category-delete-${currentRow.id}`}
            open={open === "delete"}
            onOpenChange={(state) => {
              setOpen(state ? "delete" : null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}



