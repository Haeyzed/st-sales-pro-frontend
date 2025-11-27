"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { getCookie, setCookie } from "@/lib/cookies"

type ColorProviderProps = {
  children: React.ReactNode
}

type ColorContextType = {
  accentColor: string
  setAccentColor: (color: string) => void
  resetAccentColor: () => void
  defaultAccentColor: string
}

const ColorContext = createContext<ColorContextType | undefined>(undefined)

// Default accent color (blue)
const DEFAULT_ACCENT_COLOR = "oklch(0.208 0.042 265.755)"

// Predefined accent colors in oklch format
export const ACCENT_COLORS = [
  { name: "Blue", value: "oklch(0.208 0.042 265.755)", hex: "#3b82f6" },
  { name: "Purple", value: "oklch(0.45 0.15 300)", hex: "#a855f7" },
  { name: "Pink", value: "oklch(0.55 0.18 330)", hex: "#ec4899" },
  { name: "Red", value: "oklch(0.55 0.22 25)", hex: "#ef4444" },
  { name: "Orange", value: "oklch(0.65 0.18 50)", hex: "#f97316" },
  { name: "Amber", value: "oklch(0.7 0.15 70)", hex: "#f59e0b" },
  { name: "Yellow", value: "oklch(0.85 0.15 90)", hex: "#eab308" },
  { name: "Lime", value: "oklch(0.75 0.15 120)", hex: "#84cc16" },
  { name: "Green", value: "oklch(0.5 0.15 150)", hex: "#22c55e" },
  { name: "Emerald", value: "oklch(0.5 0.12 170)", hex: "#10b981" },
  { name: "Teal", value: "oklch(0.5 0.1 190)", hex: "#14b8a6" },
  { name: "Cyan", value: "oklch(0.6 0.15 210)", hex: "#06b6d4" },
  { name: "Sky", value: "oklch(0.6 0.12 230)", hex: "#0ea5e9" },
  { name: "Indigo", value: "oklch(0.4 0.12 270)", hex: "#6366f1" },
  { name: "Violet", value: "oklch(0.45 0.13 280)", hex: "#8b5cf6" },
  { name: "Fuchsia", value: "oklch(0.5 0.18 310)", hex: "#d946ef" },
  { name: "Rose", value: "oklch(0.55 0.2 15)", hex: "#f43f5e" },
  { name: "Slate", value: "oklch(0.4 0.02 250)", hex: "#64748b" },
  { name: "Gray", value: "oklch(0.45 0.01 250)", hex: "#6b7280" },
  { name: "Zinc", value: "oklch(0.42 0.01 250)", hex: "#71717a" },
  { name: "Neutral", value: "oklch(0.4 0.005 250)", hex: "#737373" },
  { name: "Stone", value: "oklch(0.45 0.01 60)", hex: "#78716c" },
]

export function ColorProvider({ children }: ColorProviderProps) {
  // Initialize state with saved color or default
  const [accentColor, setAccentColorState] = useState<string>(() => {
    if (typeof document === "undefined") return DEFAULT_ACCENT_COLOR
    return getCookie("accent_color") || DEFAULT_ACCENT_COLOR
  })

  const applyAccentColor = useCallback((color: string) => {
    if (typeof document === "undefined") return

    const root = document.documentElement
    
    // Apply primary color - CSS variables cascade, so this works for both light and dark
    root.style.setProperty("--primary", color)
    
    // Calculate primary-foreground based on color lightness
    // For dark colors, use light foreground; for light colors, use dark foreground
    const lightness = color.includes("oklch") ? parseFloat(color.split(" ")[1]) : 0.5
    const isDarkColor = lightness < 0.5
    
    // Use appropriate foreground color based on the accent color's lightness
    // This ensures good contrast in both light and dark themes
    const foregroundColor = isDarkColor
      ? "oklch(0.984 0.003 247.858)" // Light text for dark colors
      : "oklch(0.208 0.042 265.755)" // Dark text for light colors
    
    root.style.setProperty("--primary-foreground", foregroundColor)
  }, [])

  useEffect(() => {
    // Apply the initial color on mount
    applyAccentColor(accentColor)
  }, [accentColor, applyAccentColor])

  const setAccentColor = (color: string) => {
    setAccentColorState(color)
    setCookie("accent_color", color)
    applyAccentColor(color)
  }

  const resetAccentColor = () => {
    setAccentColorState(DEFAULT_ACCENT_COLOR)
    setCookie("accent_color", DEFAULT_ACCENT_COLOR)
    applyAccentColor(DEFAULT_ACCENT_COLOR)
  }

  return (
    <ColorContext.Provider
      value={{
        accentColor,
        setAccentColor,
        resetAccentColor,
        defaultAccentColor: DEFAULT_ACCENT_COLOR,
      }}
    >
      {children}
    </ColorContext.Provider>
  )
}

export function useColor() {
  const context = useContext(ColorContext)
  if (context === undefined) {
    throw new Error("useColor must be used within a ColorProvider")
  }
  return context
}

