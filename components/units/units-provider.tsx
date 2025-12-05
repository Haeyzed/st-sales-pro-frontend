"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"
import useDialogState from "@/hooks/use-dialog-state"
import type { Unit } from "./data/schema"

type UnitsDialogType = "add" | "edit" | "delete" | "import"

type UnitsContextType = {
  open: UnitsDialogType | null
  setOpen: (str: UnitsDialogType | null) => void
  currentRow: Unit | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Unit | null>>
}

const UnitsContext = createContext<UnitsContextType | null>(null)

export function UnitsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<UnitsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Unit | null>(null)

  return <UnitsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>{children}</UnitsContext.Provider>
}

export function useUnits() {
  const context = useContext(UnitsContext)
  if (!context) {
    throw new Error("useUnits must be used within UnitsProvider")
  }
  return context
}
