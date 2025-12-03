"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { searchProductForCombo, type ComboProductSearchResult } from "../data/products"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item"
import Image from "next/image"

interface MultipleProductSearchComboboxProps {
  selectedProducts?: ComboProductSearchResult[]
  onProductsChange?: (products: ComboProductSearchResult[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  warehouseId?: number | null
}

export function MultipleProductSearchCombobox({
  selectedProducts = [],
  onProductsChange,
  placeholder = "Search related products...",
  disabled = false,
  className,
  warehouseId,
}: MultipleProductSearchComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  const { data: products, isLoading } = useQuery({
    queryKey: ["related-product-search", searchTerm, warehouseId],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return []
      return await searchProductForCombo(searchTerm, warehouseId || undefined)
    },
    enabled: searchTerm.length >= 2 && open,
  })

  const handleSelect = (product: ComboProductSearchResult) => {
    // Check if already selected
    const isAlreadySelected = selectedProducts.some(p => p.id === product.id && p.variant_id === product.variant_id)
    
    if (!isAlreadySelected) {
      onProductsChange?.([...selectedProducts, product])
    }
    
    setSearchTerm("")
    // Keep dropdown open for multiple selections
    // setOpen(false)
  }

  const handleRemove = (productId: number, variantId: number | null) => {
    const updated = selectedProducts.filter(p => !(p.id === productId && p.variant_id === variantId))
    onProductsChange?.(updated)
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'

  return (
    <div className="space-y-4">
      <Popover modal={true} open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !searchTerm && "text-muted-foreground",
              className
            )}
            disabled={disabled}
          >
            {searchTerm || placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-w-none p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Type product code or name..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Spinner />
                  <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                </div>
              ) : !searchTerm || searchTerm.length < 2 ? (
                <CommandEmpty>Type at least 2 characters to search</CommandEmpty>
              ) : !products || products.length === 0 ? (
                <CommandEmpty>No products found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {products.map((product) => {
                    const firstImage = product.image?.split(',')[0]?.trim()
                    const imageUrl = firstImage && firstImage !== 'zummXD2dvAtI.png' ? `${apiUrl}/storage/products/small/${firstImage}` : null
                    const initials = product.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                    
                    const isSelected = selectedProducts.some(p => p.id === product.id && p.variant_id === product.variant_id)

                    return (
                      <CommandItem
                        key={`${product.id}-${product.variant_id || 0}`}
                        value={`${product.name}-${product.code}`}
                        onSelect={() => handleSelect(product)}
                        disabled={isSelected}
                      >
                        <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                        <Avatar className="h-8 w-8 rounded-md mr-2">
                          {imageUrl ? (
                            <AvatarImage src={imageUrl} alt={product.name} className="object-cover" />
                          ) : null}
                          <AvatarFallback className="bg-muted text-muted-foreground rounded-md text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {product.code} - {product.price.toFixed(2)}
                          </span>
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedProducts.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Selected Products</h4>
          <ItemGroup className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {selectedProducts.map((product) => {
              const firstImage = product.image?.split(',')[0]?.trim()
              const imageUrl = firstImage && firstImage !== 'zummXD2dvAtI.png' ? `${apiUrl}/storage/products/small/${firstImage}` : null

              return (
                <Item key={`${product.id}-${product.variant_id || 0}`} variant="outline" className="relative group">
                  <button
                    type="button"
                    onClick={() => handleRemove(product.id, product.variant_id)}
                    className="absolute top-1 right-1 z-10 h-6 w-6 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <ItemHeader>
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        width={96}
                        height={96}
                        className="aspect-square w-full object-cover"
                      />
                    ) : (
                      <div className="aspect-square w-full bg-muted flex items-center justify-center">
                        <span className="text-lg font-semibold text-muted-foreground">
                          {product.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                    )}
                  </ItemHeader>
                  <ItemContent>
                    <ItemTitle className="line-clamp-2 text-xs">{product.name}</ItemTitle>
                    <ItemDescription className="text-[10px]">{product.code}</ItemDescription>
                  </ItemContent>
                </Item>
              )
            })}
          </ItemGroup>
        </div>
      )}
    </div>
  )
}

