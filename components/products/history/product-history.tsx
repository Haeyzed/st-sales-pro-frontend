"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { getProduct } from "@/components/products/data/products"
import { type Product } from "@/components/products/data/schema"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { HistoryTable } from "./history-table"

interface ProductHistoryProps {
  productId: number
}

export function ProductHistory({ productId }: ProductHistoryProps) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load product details
  useEffect(() => {
    async function loadProduct() {
      try {
        const productData = await getProduct(productId)
        setProduct(productData)
      } catch (error: any) {
        toast.error(error?.message || "Failed to load product")
        router.push("/products")
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [productId, router])

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/products")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Product History</h2>
            <p className="text-muted-foreground">
              {product.name} [{product.code}]
            </p>
          </div>
        </div>
      </div>

      {/* History Table */}
      <HistoryTable productId={productId} />
    </>
  )
}

