"use client"

import { Upload, FolderPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCategories } from "../categories-provider"
import { PermissionGate } from "@/components/permission-gate"

export function CategoriesPrimaryButtons() {
  const { setOpen } = useCategories()
  return (
    <div className="flex gap-2">
      <PermissionGate action="categories:create">
        <Button
          variant="outline"
          className="space-x-1"
          onClick={() => setOpen("import")}
        >
          <span>Import</span> <Upload size={18} />
        </Button>
      </PermissionGate>
      <PermissionGate action="categories:create">
        <Button className="space-x-1" onClick={() => setOpen("add")}>
          <span>Add Category</span> <FolderPlus size={18} />
        </Button>
      </PermissionGate>
    </div>
  )
}



