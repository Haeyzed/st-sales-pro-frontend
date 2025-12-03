"use client"

import { useEffect, useRef } from "react"

interface BarcodeSvgProps {
  value: string
  width?: number
  height?: number
  displayValue?: boolean
}

export function BarcodeSvg({ value, width = 2, height = 50, displayValue = false }: BarcodeSvgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Simple Code 128 barcode encoding (simplified version)
    // For production, you'd want a full implementation
    const barcodeWidth = value.length * 12 // Approximate width
    canvas.width = barcodeWidth
    canvas.height = height

    // Clear canvas
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw bars (simplified - just alternating pattern for demo)
    ctx.fillStyle = "black"
    let x = 0
    const barWidth = width

    // Simple encoding: each character generates a pattern
    for (let i = 0; i < value.length; i++) {
      const charCode = value.charCodeAt(i)
      // Create a simple pattern based on character code
      const pattern = (charCode % 10).toString(2).padStart(4, "0")
      
      for (let j = 0; j < pattern.length; j++) {
        if (pattern[j] === "1") {
          ctx.fillRect(x, 0, barWidth, height)
        }
        x += barWidth
      }
      x += barWidth // Space between character patterns
    }
  }, [value, width, height])

  return (
    <div style={{ textAlign: "center" }}>
      <canvas ref={canvasRef} style={{ maxWidth: "100%", height: "auto" }} />
      {displayValue && (
        <div style={{ fontSize: "10px", marginTop: "2px" }}>{value}</div>
      )}
    </div>
  )
}

