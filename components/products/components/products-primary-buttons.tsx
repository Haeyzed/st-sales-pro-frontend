"use client"

import { Upload, PackagePlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useProducts } from "../products-provider"
import { PermissionGate } from "@/components/permission-gate"

export function ProductsPrimaryButtons() {
  const { setOpen } = useProducts()
  const router = useRouter()
  
  return (
    <div className="flex gap-2">
      <PermissionGate action="products:create">
        <Button
          variant="outline"
          className="space-x-1"
          onClick={() => setOpen("import")}
        >
          <span>Import</span> <Upload size={18} />
        </Button>
      </PermissionGate>
      <PermissionGate action="products:create">
        <Button 
          className="space-x-1" 
          onClick={() => router.push("/products/create")}
        >
          <span>Add Product</span> <PackagePlus size={18} />
        </Button>
      </PermissionGate>
    </div>
  )
}

