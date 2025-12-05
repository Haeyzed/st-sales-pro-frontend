"use client"

import { UnitsActionDialog } from "./units-action-dialog"
import { UnitsDeleteDialog } from "./units-delete-dialog"
import { UnitsImportDialog } from "./units-import-dialog"
import { useUnits } from "../units-provider"

export function UnitsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUnits()
  return (
    <>
      <UnitsActionDialog key="unit-add" open={open === "add"} onOpenChange={(state) => setOpen(state ? "add" : null)} />

      <UnitsImportDialog
        key="unit-import"
        open={open === "import"}
        onOpenChange={(state) => setOpen(state ? "import" : null)}
      />

      {currentRow && (
        <>
          <UnitsActionDialog
            key={`unit-edit-${currentRow.id}`}
            open={open === "edit"}
            onOpenChange={(state) => {
              setOpen(state ? "edit" : null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <UnitsDeleteDialog
            key={`unit-delete-${currentRow.id}`}
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
