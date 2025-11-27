"use client"

import { Construction } from "lucide-react"

export function ComingSoon({ title }: { title?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <Construction className="h-16 w-16 text-muted-foreground" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {title || "Coming Soon"}
          </h1>
          <p className="text-muted-foreground">
            This page is under development and will be available soon.
          </p>
        </div>
      </div>
    </div>
  )
}
