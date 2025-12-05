"use client"

import { createContext, useContext, useState } from "react"
import useDialogState from "@/hooks/use-dialog-state"
import { type Brand } from "./data/schema"

type BrandsDialogType = "add" | "edit" | "delete" | "import"

type BrandsContextType = {
  open: BrandsDialogType | null
  setOpen: (str: BrandsDialogType | null) => void
  currentRow: Brand | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Brand | null>>
}

const BrandsContext = createContext<BrandsContextType | null>(null)

export function BrandsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<BrandsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Brand | null>(null)

  return (
    <BrandsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </BrandsContext.Provider>
  )
}

export function useBrands() {
  const context = useContext(BrandsContext)
  if (!context) {
    throw new Error("useBrands must be used within BrandsProvider")
  }
  return context
}

