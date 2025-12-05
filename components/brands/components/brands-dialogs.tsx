"use client"

import { BrandsActionDialog } from "./brands-action-dialog"
import { BrandsDeleteDialog } from "./brands-delete-dialog"
import { BrandsImportDialog } from "./brands-import-dialog"
import { useBrands } from "../brands-provider"

export function BrandsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useBrands()
  return (
    <>
      <BrandsActionDialog
        key="brand-add"
        open={open === "add"}
        onOpenChange={(state) => setOpen(state ? "add" : null)}
      />

      <BrandsImportDialog
        key="brand-import"
        open={open === "import"}
        onOpenChange={(state) => setOpen(state ? "import" : null)}
      />

      {currentRow && (
        <>
          <BrandsActionDialog
            key={`brand-edit-${currentRow.id}`}
            open={open === "edit"}
            onOpenChange={(state) => {
              setOpen(state ? "edit" : null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <BrandsDeleteDialog
            key={`brand-delete-${currentRow.id}`}
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

