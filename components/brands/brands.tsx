"use client"

import { BrandsDialogs } from "./components/brands-dialogs"
import { BrandsPrimaryButtons } from "./components/brands-primary-buttons"
import { BrandsProvider } from "./brands-provider"
import { BrandsTable } from "./brands-table"

export function Brands() {
  return (
    <BrandsProvider>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Brands</h2>
          <p className="text-muted-foreground">
            Manage your product brands here.
          </p>
        </div>
        <BrandsPrimaryButtons />
      </div>
      <BrandsTable />
      <BrandsDialogs />
    </BrandsProvider>
  )
}

