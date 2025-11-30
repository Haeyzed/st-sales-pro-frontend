"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { importProducts } from "../data/products"

type ProductsImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductsImportDialog({
  open,
  onOpenChange,
}: ProductsImportDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file to import")
      return
    }

    setIsLoading(true)
    try {
      const result = await importProducts(file)
      toast.success(
        `Successfully imported ${result.imported} product${
          result.imported !== 1 ? "s" : ""
        }`
      )
      if (result.errors.length > 0) {
        toast.error(`${result.errors.length} error(s) occurred during import`)
      }
      queryClient.invalidateQueries({ queryKey: ["products"] })
      setFile(null)
      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to import products"
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Products</DialogTitle>
            <DialogDescription>
              Upload a CSV file to import products. Make sure the file follows
              the required format.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label>
              Select File:
              <Input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={isLoading}
              />
            </Label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!file || isLoading}>
              {isLoading ? "Importing..." : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Import Products</DrawerTitle>
          <DrawerDescription>
            Upload a CSV file to import products. Make sure the file follows the
            required format.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 space-y-4">
          <Label>
            Select File:
            <Input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={isLoading}
            />
          </Label>
        </div>
        <DrawerFooter>
          <Button onClick={handleImport} disabled={!file || isLoading}>
            {isLoading ? "Importing..." : "Import"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

