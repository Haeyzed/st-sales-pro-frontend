"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useUnits } from "../units-provider"
import { importUnits } from "../data/units"

export function UnitImportDialog() {
  const { open, setOpen } = useUnits()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleImport = async () => {
    if (!file) return

    try {
      setIsLoading(true)
      await importUnits(file)
      queryClient.invalidateQueries({ queryKey: ["units"] })
      setOpen(null)
      setFile(null)
    } catch (error) {
      console.error("Error importing units:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open === "import"} onOpenChange={() => setOpen(null)}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Import Units</DialogTitle>
          <DialogDescription>Upload a CSV file to import units in bulk.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="csv-input"
            />
            <label htmlFor="csv-input" className="cursor-pointer text-sm text-muted-foreground">
              {file ? file.name : "Click to select CSV file"}
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(null)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!file || isLoading}>
              {isLoading ? "Importing..." : "Import"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
