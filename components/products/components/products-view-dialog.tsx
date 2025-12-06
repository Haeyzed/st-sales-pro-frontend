"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"
import { type Product } from "../data/schema"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn, formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom"

type ProductsViewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Product
}

export function ProductsViewDialog({
  open,
  onOpenChange,
  currentRow: product,
}: ProductsViewDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const imageString = product.image
  const images = imageString && imageString !== 'zummXD2dvAtI.png' 
    ? imageString.split(',').map(img => img.trim()) 
    : []
  
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  const content = (
    <>
      <div className="grid gap-6 md:grid-cols-2">
          {/* Images Section */}
          <div className="space-y-4">
            {images.length > 0 ? (
              <Carousel 
                className="w-full"
                plugins={images.length > 1 ? [plugin.current] : []}
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
              >
                <CarouselContent>
                  {images.map((img, index) => (
                    <CarouselItem key={index}>
                      <div className="p-1">
                        <div className="rounded-lg border overflow-hidden">
                          <ImageZoom 
                          zoomMargin={100}
                          backdropClassName={cn(
                            '[&_[data-rmiz-modal-overlay="visible"]]:bg-black/80 dark:[&_[data-rmiz-modal-overlay="visible"]]:bg-white/80 light:[&_[data-rmiz-modal-overlay="visible"]]:bg-white/80'
                          )}>
                          <Image
                            src={img}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-auto object-cover aspect-square"
                            unoptimized
                            width={500}
                            height={500}
                            />
                          </ImageZoom>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {images.length > 1 && (
                  <>
                    <CarouselPrevious />
                    <CarouselNext />
                  </>
                )}
              </Carousel>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-lg border bg-muted">
                <Avatar className="h-32 w-32 rounded-md">
                  <AvatarFallback className="bg-muted text-muted-foreground rounded-md text-4xl">
                    {product.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold">{product.name}</h3>
              <p className="text-muted-foreground font-mono">{product.code}</p>
            </div>

            <div className="grid gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Type:</span>
                <Badge variant="outline" className="capitalize">
                  {product.type}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Brand:</span>
                <span className="text-sm font-medium">
                  {product.brand?.title || "N/A"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Category:</span>
                <span className="text-sm font-medium">
                  {product.category?.name || "N/A"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Unit:</span>
                <span className="text-sm font-medium">
                  {product.unit?.unit_name || "N/A"}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Quantity:</span>
                <span className="text-sm font-semibold">
                  {product.qty ?? 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Cost:</span>
                <span className="text-sm font-medium text-muted-foreground">
                  {formatCurrency(product.cost)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Price:</span>
                <span className="text-sm font-semibold">
                  {formatCurrency(product.price)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tax:</span>
                <span className="text-sm font-medium">
                  {product.tax?.name || "N/A"}
                  {product.tax && ` (${product.tax.rate}%)`}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tax Method:</span>
                <Badge variant="secondary" className="capitalize">
                  {product.tax_method || "N/A"}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Alert Quantity:</span>
                <span className="text-sm font-medium">
                  {product.alert_quantity ?? "N/A"}
                </span>
              </div>

              {product.warranty && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Warranty:</span>
                  <span className="text-sm font-medium">
                    {product.warranty} {product.warranty_type}
                  </span>
                </div>
              )}

              {product.guarantee && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Guarantee:</span>
                  <span className="text-sm font-medium">
                    {product.guarantee} {product.guarantee_type}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Details */}
        {product.product_details && (() => {
          try {
            // Try to parse as JSON (Lexical format)
            const parsed = JSON.parse(product.product_details)
            if (parsed.root && parsed.root.children) {
              // Extract text from Lexical JSON structure
              const extractText = (node: any): string => {
                if (node.type === 'text') {
                  return node.text || ''
                }
                if (node.children) {
                  return node.children.map(extractText).join('')
                }
                return ''
              }
              const text = parsed.root.children.map(extractText).join('\n')
              return text ? (
                <div className="space-y-2">
                  <h4 className="font-semibold">Product Details</h4>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {text}
                  </div>
                </div>
              ) : null
            }
          } catch {
            // If not JSON, treat as plain text or HTML
            const isHTML = /<[^>]+>/.test(product.product_details)
            if (isHTML) {
              return (
                <div className="space-y-2">
                  <h4 className="font-semibold">Product Details</h4>
                  <div 
                    className="text-sm text-muted-foreground prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.product_details }}
                  />
                </div>
              )
            }
            // Plain text
            return (
              <div className="space-y-2">
                <h4 className="font-semibold">Product Details</h4>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {product.product_details}
                </div>
              </div>
            )
          }
          return null
        })()}

        {/* Product Variants */}
        {product.is_variant && product.variants && product.variants.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <div>
              <h4 className="font-semibold mb-4">Product Variant Information</h4>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Variant</TableHead>
                      <TableHead>Item Code</TableHead>
                      <TableHead className="text-right">Additional Cost</TableHead>
                      <TableHead className="text-right">Additional Price</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.variants.map((variant) => (
                      <TableRow key={variant.id || variant.variant_id}>
                        <TableCell className="font-medium">
                          {variant.name || `Variant ${variant.variant_id}`}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {variant.item_code || "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(variant.additional_cost)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(variant.additional_price)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {variant.qty}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
    </>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              View detailed information about this product
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Product Details</DrawerTitle>
          <DrawerDescription>
            View detailed information about this product
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4">
          {content}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

