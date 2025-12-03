"use client"

import { Upload, PackagePlus, Wifi } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useProducts } from "../products-provider"
import { PermissionGate } from "@/components/permission-gate"
import { apiPostClient } from "@/lib/api-client-client"
import { toast } from "sonner"
import { useState } from "react"
import { Spinner } from "@/components/ui/spinner"

export function ProductsPrimaryButtons() {
  const { setOpen } = useProducts()
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleShowAllOnline = async () => {
    try {
      setIsUpdating(true)
      const response = await apiPostClient("products/show-all-online")
      toast.success(response.message || "All products are now shown online")
      window.location.reload() // Reload to reflect changes
    } catch (error: any) {
      toast.error(error?.message || "Failed to update products")
    } finally {
      setIsUpdating(false)
    }
  }
  
  return (
    <div className="flex gap-2">
      <PermissionGate action="products:update">
        <Button
          variant="secondary"
          className="space-x-1"
          onClick={handleShowAllOnline}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <>
              <Spinner />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <span>Show All Online</span>
              <Wifi size={18} />
            </>
          )}
        </Button>
      </PermissionGate>
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

