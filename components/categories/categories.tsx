"use client"

import { CategoriesDialogs } from "./components/categories-dialogs"
import { CategoriesPrimaryButtons } from "./components/categories-primary-buttons"
import { CategoriesProvider } from "./categories-provider"
import { CategoriesTable } from "./categories-table"

export function Categories() {
  return (
    <CategoriesProvider>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Category List</h2>
          <p className="text-muted-foreground">
            Manage your product categories here.
          </p>
        </div>
        <CategoriesPrimaryButtons />
      </div>
      <CategoriesTable />
      <CategoriesDialogs />
    </CategoriesProvider>
  )
}



