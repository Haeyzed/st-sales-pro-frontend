"use client"

interface BarcodeProps {
  value: string
  height?: number
  showValue?: boolean
}

export function Barcode({ value, height = 50, showValue = true }: BarcodeProps) {
  // Generate a barcode pattern based on the value
  const generateBars = (str: string) => {
    const bars: { width: number; filled: boolean }[] = []

    // Start guard
    bars.push({ width: 2, filled: true })
    bars.push({ width: 2, filled: false })
    bars.push({ width: 2, filled: true })

    // Generate pattern from string
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i)
      bars.push({ width: 1 + (charCode % 3), filled: true })
      bars.push({ width: 1 + ((charCode * 2) % 3), filled: false })
      bars.push({ width: 1 + ((charCode * 3) % 2), filled: true })
      bars.push({ width: 1, filled: false })
    }

    // End guard
    bars.push({ width: 2, filled: true })
    bars.push({ width: 2, filled: false })
    bars.push({ width: 2, filled: true })

    return bars
  }

  const bars = generateBars(value)

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-end overflow-hidden bg-white px-1" style={{ height: height + 4 }}>
        {bars.map((bar, index) => (
          <div
            key={index}
            className={bar.filled ? "bg-black" : "bg-transparent"}
            style={{
              width: bar.width,
              height: height,
            }}
          />
        ))}
      </div>
      {showValue && <span className="mt-1 font-mono text-[9px] tracking-wider text-foreground">{value}</span>}
    </div>
  )
}
