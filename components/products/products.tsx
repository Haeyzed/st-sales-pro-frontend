"use client"

import { ProductsDialogs } from "./components/products-dialogs"
import { ProductsPrimaryButtons } from "./components/products-primary-buttons"
import { ProductsProvider } from "./products-provider"
import { ProductsTable } from "./products-table"

export function Products() {
  return (
    <ProductsProvider>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Product List</h2>
          <p className="text-muted-foreground">
            Manage your products here.
          </p>
        </div>
        <ProductsPrimaryButtons />
      </div>
      <ProductsTable />
      <ProductsDialogs />
    </ProductsProvider>
  )
}

