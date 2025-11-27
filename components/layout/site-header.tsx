"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type SiteHeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
}

export function SiteHeader({
  className,
  fixed,
  children,
  ...props
}: SiteHeaderProps) {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    // Add scroll listener to the body
    document.addEventListener("scroll", onScroll, { passive: true })

    // Clean up the event listener on unmount
    return () => document.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "z-50 h-16",
        fixed && "header-fixed peer/header sticky top-0 w-full",
        offset > 10 && fixed ? "shadow" : "shadow-none",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "relative flex h-full items-center justify-end gap-3 p-4 sm:gap-4",
          offset > 10 &&
            fixed &&
            "after:bg-background/20 after:absolute after:inset-0 after:-z-10 after:backdrop-blur-lg"
        )}
      >
        {children}
      </div>
    </header>
  )
}
