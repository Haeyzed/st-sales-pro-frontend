"use client"

import { createContext, useContext, useState } from "react"
import useDialogState from "@/hooks/use-dialog-state"
import { type Product } from "./data/schema"

type ProductsDialogType = "add" | "edit" | "delete" | "import"

type ProductsContextType = {
  open: ProductsDialogType | null
  setOpen: (str: ProductsDialogType | null) => void
  currentRow: Product | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Product | null>>
}

const ProductsContext = createContext<ProductsContextType | null>(null)

export function ProductsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<ProductsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Product | null>(null)

  return (
    <ProductsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (!context) {
    throw new Error("useProducts must be used within ProductsProvider")
  }
  return context
}

