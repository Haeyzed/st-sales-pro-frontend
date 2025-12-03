"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
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
import { Label } from "@/components/ui/label"
import { Download } from "lucide-react"
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadList,
  FileUploadItem,
  FileUploadItemPreview,
  FileUploadItemMetadata,
  FileUploadItemDelete,
} from "@/components/ui/file-upload"
import { importCategories } from "../data/categories"

type CategoryImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoriesImportDialog({
  open,
  onOpenChange,
}: CategoryImportDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const queryClient = useQueryClient()
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleDownloadTemplate = () => {
    // For now, just show a message
    toast.info("Template download will be available soon")
  }

  const handleImport = async () => {
    if (files.length === 0) {
      toast.error("Please select a file to import")
      return
    }

    setIsLoading(true)
    try {
      const result = await importCategories(files[0])
      toast.success(
        `Successfully imported ${result.imported} categories${
          result.errors.length > 0
            ? ` with ${result.errors.length} errors`
            : ""
        }`
      )
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      setFiles([])
      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to import categories"
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
            <DialogTitle>Import Categories</DialogTitle>
            <DialogDescription>
              Upload a CSV file to import categories. Make sure the file follows
              the required format.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Select File</Label>
              <FileUpload
                value={files}
                onValueChange={setFiles}
                accept=".csv,.xls,.xlsx"
                maxFiles={1}
                disabled={isLoading}
              >
                <FileUploadDropzone>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop a CSV/Excel file here, or click to browse
                  </p>
                </FileUploadDropzone>
                <FileUploadList>
                  {files.map((file, index) => (
                    <FileUploadItem key={index} value={file}>
                      <FileUploadItemPreview />
                      <FileUploadItemMetadata />
                      <FileUploadItemDelete />
                    </FileUploadItem>
                  ))}
                </FileUploadList>
              </FileUpload>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={files.length === 0 || isLoading}>
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
          <DrawerTitle>Import Categories</DrawerTitle>
          <DrawerDescription>
            Upload a CSV file to import categories. Make sure the file follows the
            required format.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>
          <div className="space-y-2">
            <Label>Select File</Label>
            <FileUpload
              value={files}
              onValueChange={setFiles}
              accept=".csv,.xls,.xlsx"
              maxFiles={1}
              disabled={isLoading}
            >
              <FileUploadDropzone>
                <p className="text-sm text-muted-foreground">
                  Drag and drop a CSV/Excel file here, or click to browse
                </p>
              </FileUploadDropzone>
              <FileUploadList>
                {files.map((file, index) => (
                  <FileUploadItem key={index} value={file}>
                    <FileUploadItemPreview />
                    <FileUploadItemMetadata />
                    <FileUploadItemDelete />
                  </FileUploadItem>
                ))}
              </FileUploadList>
            </FileUpload>
          </div>
        </div>
        <DrawerFooter>
          <Button onClick={handleImport} disabled={files.length === 0 || isLoading}>
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



