"use client"

import { LayoutProvider } from "@/context/layout-provider"
import { SearchProvider } from "@/context/search-provider"
import { SkipToMain } from "@/components/skip-to-main"

type SiteLayoutProps = {
  children?: React.ReactNode
}

export function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <SearchProvider>
      <LayoutProvider>
        <SkipToMain />
        {children}
      </LayoutProvider>
    </SearchProvider>
  )
}
