"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

  const productImage = product.image ? product.image.split(",")[0] : null

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/products")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {productImage && (
            <Avatar className="h-12 w-12 rounded-md">
              <AvatarImage
                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/products/small/${productImage}`}
                alt={product.name}
              />
              <AvatarFallback className="rounded-md">
                {product.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Product History</h2>
            <p className="text-muted-foreground">
              {product.name} [{product.code}]
            </p>
          </div>
        </div>
      </div>

      {/* History Table */}
      <HistoryTable productId={productId} product={product} />
    </>
  )
}

