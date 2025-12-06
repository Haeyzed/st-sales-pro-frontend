"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { searchProductForCombo, type ComboProductSearchResult } from "../data/products"
import { Check, ChevronsUpDown } from "lucide-react"
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
} from "@/components/ui/item"

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
    
    // Don't clear search term or close dropdown for multiple selections
    // setSearchTerm("")
    // setOpen(false)
  }

  const handleRemove = (productId: number, variantId: number | null) => {
    const updated = selectedProducts.filter(p => !(p.id === productId && p.variant_id === variantId))
    onProductsChange?.(updated)
  }

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
                    // Image is already a full URL from API
                    const firstImage = product.image?.split(',')[0]?.trim()
                    const imageUrl = firstImage ? firstImage : null
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
    </div>
  )
}

