import { cn } from "@/lib/utils"

type SiteMainProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  fluid?: boolean
}

export function SiteMain({ fixed, className, fluid, ...props }: SiteMainProps) {
  return (
    <main
      id="content"
      data-layout={fixed ? "fixed" : "auto"}
      className={cn(
        "flex min-h-[calc(100vh-4rem)] flex-col px-4 py-6",
        // If layout is fixed, make the main container flex and grow
        fixed && "flex grow flex-col overflow-hidden",
        // If layout is not fluid, set the max-width
        !fluid &&
          "@7xl/content:mx-auto @7xl/content:w-full @7xl/content:max-w-7xl",
        className
      )}
      {...props}
    />
  )
}

