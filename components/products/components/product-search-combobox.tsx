"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { searchProductForCombo, type ComboProductSearchResult } from "../data/products"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
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

interface ProductSearchComboboxProps {
  onProductSelect?: (product: ComboProductSearchResult) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  warehouseId?: number | null
}

export function ProductSearchCombobox({
  onProductSelect,
  placeholder = "Search product by code or name...",
  disabled = false,
  className,
  warehouseId,
}: ProductSearchComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  const { data: products, isLoading } = useQuery({
    queryKey: ["combo-product-search", searchTerm, warehouseId],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return []
      return await searchProductForCombo(searchTerm, warehouseId || undefined)
    },
    enabled: searchTerm.length >= 2 && open,
  })

  const handleSelect = (product: ComboProductSearchResult) => {
    onProductSelect?.(product)
    setSearchTerm("")
    setOpen(false)
  }

  return (
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
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'
                  const imageUrl = firstImage && firstImage !== 'zummXD2dvAtI.png' ? `${apiUrl}/storage/products/small/${firstImage}` : null
                  const initials = product.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)

                  return (
                    <CommandItem
                      key={`${product.id}-${product.variant_id || 0}`}
                      value={`${product.name}-${product.code}`}
                      onSelect={() => handleSelect(product)}
                    >
                      <Check className="mr-2 h-4 w-4 opacity-0" />
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
  )
}

