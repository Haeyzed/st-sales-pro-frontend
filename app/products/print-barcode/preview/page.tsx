import { Suspense } from "react"
import { BarcodePreview } from "@/components/products/components/barcode-preview"

export default function PrintBarcodePreviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BarcodePreview />
    </Suspense>
  )
}

