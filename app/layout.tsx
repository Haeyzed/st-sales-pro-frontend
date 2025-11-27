import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/providers/theme-provider"
import { QueryProvider } from "@/providers/query-provider"
import { NextAuthSessionProvider } from "@/providers/session-provider"
import { DirectionProvider } from "@/context/direction-provider"
import { LayoutProvider } from "@/context/layout-provider"
import { ColorProvider } from "@/context/color-provider"
import { Toaster } from "@/components/ui/sonner"
import NextTopLoader from "nextjs-toploader"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ST Sales Pro",
  description: "Modern sales management platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextTopLoader
          color="hsl(var(--primary))"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px hsl(var(--primary)),0 0 5px hsl(var(--primary))"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DirectionProvider>
            <LayoutProvider>
              <ColorProvider>
                <NextAuthSessionProvider>
                  <QueryProvider>
                    {children}
                    <Toaster />
                  </QueryProvider>
                </NextAuthSessionProvider>
              </ColorProvider>
            </LayoutProvider>
          </DirectionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
