"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getBarcodeSetting } from "../data/products"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Printer, ChevronLeft, ChevronRight, FileText, Tag, ArrowLeft } from "lucide-react"
import Barcode from "react-barcode"
import Link from "next/link"

type Product = {
  product_id: number
  variant_id?: number
  name: string
  code: string
  qty: number
  image?: string
  price: number
  promo_price?: number
  currency: string
  currency_position: string
  brand_name?: string
}

type BarcodeSetting = {
  id: number
  name: string
  description?: string
  width: number
  height: number
  paper_width: number
  paper_height: number
  top_margin: number
  left_margin: number
  row_distance: number
  col_distance: number
  stickers_in_one_row: number
  is_default?: number
  is_continuous: number
  stickers_in_one_sheet: number
  is_custom?: number
}

export function BarcodePreview() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [printSettings, setPrintSettings] = useState<Record<string, any>>({})
  const [barcodeSettingId, setBarcodeSettingId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    // Parse products from URL
    const productsData: Product[] = []
    let index = 0
    while (searchParams.has(`products[${index}][product_id]`)) {
      productsData.push({
        product_id: Number.parseInt(searchParams.get(`products[${index}][product_id]`) || "0"),
        variant_id: searchParams.get(`products[${index}][variant_id]`)
          ? Number.parseInt(searchParams.get(`products[${index}][variant_id]`)!)
          : undefined,
        name: searchParams.get(`products[${index}][name]`) || "",
        code: searchParams.get(`products[${index}][code]`) || "",
        qty: Number.parseInt(searchParams.get(`products[${index}][qty]`) || "1"),
        image: searchParams.get(`products[${index}][image]`) || undefined,
        price: Number.parseFloat(searchParams.get(`products[${index}][price]`) || "0"),
        promo_price: searchParams.get(`products[${index}][promo_price]`)
          ? Number.parseFloat(searchParams.get(`products[${index}][promo_price]`)!)
          : undefined,
        currency: searchParams.get(`products[${index}][currency]`) || "$",
        currency_position: searchParams.get(`products[${index}][currency_position]`) || "prefix",
        brand_name: searchParams.get(`products[${index}][brand_name]`) || undefined,
      })
      index++
    }
    setProducts(productsData)

    // Parse print settings
    const settings: Record<string, any> = {}
    searchParams.forEach((value, key) => {
      if (key.startsWith("print_")) {
        settings[key] = value === "1" ? true : Number.parseInt(value) || value
      }
    })
    setPrintSettings(settings)

    // Get barcode setting ID
    const settingId = searchParams.get("barcode_setting_id")
    if (settingId) {
      setBarcodeSettingId(Number.parseInt(settingId))
    }
  }, [searchParams])

  const {
    data: barcodeSetting,
    isLoading: isLoadingSetting,
    error,
  } = useQuery({
    queryKey: ["barcode-setting", barcodeSettingId],
    queryFn: async () => {
      if (!barcodeSettingId) throw new Error("No barcode setting ID")
      const data = await getBarcodeSetting(barcodeSettingId)
      return {
        ...data,
        width: typeof data.width === "string" ? Number.parseFloat(data.width) : data.width,
        height: typeof data.height === "string" ? Number.parseFloat(data.height) : data.height,
        paper_width: typeof data.paper_width === "string" ? Number.parseFloat(data.paper_width) : data.paper_width,
        paper_height: typeof data.paper_height === "string" ? Number.parseFloat(data.paper_height) : data.paper_height,
        top_margin: typeof data.top_margin === "string" ? Number.parseFloat(data.top_margin) : data.top_margin,
        left_margin: typeof data.left_margin === "string" ? Number.parseFloat(data.left_margin) : data.left_margin,
        row_distance: typeof data.row_distance === "string" ? Number.parseFloat(data.row_distance) : data.row_distance,
        col_distance: typeof data.col_distance === "string" ? Number.parseFloat(data.col_distance) : data.col_distance,
        is_continuous: typeof data.is_continuous === "number" ? data.is_continuous : data.is_continuous ? 1 : 0,
      } as BarcodeSetting
    },
    enabled: !!barcodeSettingId,
  })

  const labels = products.flatMap((product) => Array.from({ length: product.qty }, () => product))

  const handlePrint = () => {
    window.print()
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Failed to Load Settings</h3>
                <p className="text-muted-foreground text-sm mt-1">{(error as Error).message}</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/products">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Products
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoadingSetting || !barcodeSetting) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8" />
          <p className="text-muted-foreground">Loading barcode settings...</p>
        </div>
      </div>
    )
  }

  const stickersPerSheet = barcodeSetting.is_continuous
    ? barcodeSetting.stickers_in_one_row
    : barcodeSetting.stickers_in_one_sheet
  const pages: Product[][] = []
  for (let i = 0; i < labels.length; i += stickersPerSheet) {
    pages.push(labels.slice(i, i + stickersPerSheet))
  }

  const marginTop = barcodeSetting.is_continuous ? 0 : barcodeSetting.top_margin
  const marginLeft = barcodeSetting.is_continuous ? 0 : barcodeSetting.left_margin
  const paperWidth = barcodeSetting.paper_width
  const paperHeight = barcodeSetting.is_continuous ? barcodeSetting.height : barcodeSetting.paper_height

  // Scale factor for preview (pixels per inch)
  const SCALE = 96

  const formatPrice = (product: Product) => {
    const price = printSettings.print_promo_price && product.promo_price ? product.promo_price : product.price
    const currencySymbol = product.currency
    const formattedPrice = price.toFixed(2)

    if (product.currency_position === "prefix") {
      return `${currencySymbol}${formattedPrice}`
    }
    return `${formattedPrice}${currencySymbol}`
  }

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .print-area {
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            background: white !important;
          }
          @page {
            size: ${paperWidth}in ${paperHeight}in;
            margin-top: ${marginTop}in;
            margin-bottom: ${marginTop}in;
            margin-left: ${marginLeft}in;
            margin-right: ${marginLeft}in;
          }
          .barcode-sheet {
            page-break-after: always;
            box-shadow: none !important;
            border: none !important;
          }
          .barcode-label {
            border: none !important;
          }
        }
      `}</style>

      {/* Header - Hidden when printing */}
      <div className="no-print sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/products">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h1 className="font-semibold text-sm">Barcode Preview</h1>
                  <p className="text-xs text-muted-foreground">{barcodeSetting.name}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{labels.length} Labels</Badge>
                <Badge variant="outline">
                  {pages.length} {pages.length === 1 ? "Sheet" : "Sheets"}
                </Badge>
              </div>
              <Button onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Print All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Page Navigation - Hidden when printing */}
      {pages.length > 1 && (
        <div className="no-print sticky top-[57px] z-40 bg-muted/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[100px] text-center">
                Sheet {currentPage + 1} of {pages.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
                disabled={currentPage === pages.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Area */}
      <div className="no-print min-h-screen bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          {/* Settings Info Card */}
          <Card className="mb-6 max-w-2xl mx-auto">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Sheet Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="py-3 pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Paper Size</p>
                  <p className="font-medium">
                    {paperWidth}" x {paperHeight}"
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Label Size</p>
                  <p className="font-medium">
                    {barcodeSetting.width}" x {barcodeSetting.height}"
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Labels/Sheet</p>
                  <p className="font-medium">{stickersPerSheet}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Columns</p>
                  <p className="font-medium">{barcodeSetting.stickers_in_one_row}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sheet Preview */}
          <div className="flex justify-center">
            <div
              className="barcode-sheet bg-white rounded-lg shadow-xl border"
              style={{
                width: `${paperWidth * SCALE}px`,
                minHeight: `${paperHeight * SCALE}px`,
                padding: `${marginTop * SCALE}px ${marginLeft * SCALE}px`,
              }}
            >
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${barcodeSetting.stickers_in_one_row}, ${barcodeSetting.width * SCALE}px)`,
                  gap: `${barcodeSetting.row_distance * SCALE}px ${barcodeSetting.col_distance * SCALE}px`,
                }}
              >
                {pages[currentPage]?.map((product, index) => (
                  <div
                    key={index}
                    className="barcode-label border border-dashed border-gray-200 rounded flex items-center justify-center overflow-hidden"
                    style={{
                      width: `${barcodeSetting.width * SCALE}px`,
                      height: `${barcodeSetting.height * SCALE}px`,
                    }}
                  >
                    <div className="text-center px-1">
                      {/* Business Name */}
                      {printSettings.print_business_name && (
                        <p
                          className="font-bold truncate"
                          style={{ fontSize: `${printSettings.print_business_name_size || 12}px` }}
                        >
                          Your Business Name
                        </p>
                      )}

                      {/* Product Name */}
                      {printSettings.print_name && (
                        <p className="truncate" style={{ fontSize: `${printSettings.print_name_size || 11}px` }}>
                          {product.name}
                        </p>
                      )}

                      {/* Brand Name */}
                      {printSettings.print_brand_name && product.brand_name && (
                        <p
                          className="text-gray-600 truncate"
                          style={{ fontSize: `${printSettings.print_brand_name_size || 10}px` }}
                        >
                          {product.brand_name}
                        </p>
                      )}

                      {/* Price */}
                      {printSettings.print_price && (
                        <p className="font-semibold" style={{ fontSize: `${printSettings.print_price_size || 12}px` }}>
                          {printSettings.print_promo_price && product.promo_price ? (
                            <span className="flex items-center justify-center gap-1">
                              <span className="line-through text-gray-400 text-[10px]">
                                {product.currency_position === "prefix" ? product.currency : ""}
                                {product.price.toFixed(2)}
                                {product.currency_position === "suffix" ? product.currency : ""}
                              </span>
                              <span>{formatPrice(product)}</span>
                            </span>
                          ) : (
                            formatPrice(product)
                          )}
                        </p>
                      )}

                      {/* Barcode */}
                      <div className="mt-1">
                        <Barcode
                          value={product.code}
                          width={1.2}
                          height={Math.max(20, Math.floor(barcodeSetting.height * 0.3 * SCALE))}
                          fontSize={9}
                          displayValue={true}
                          margin={0}
                          background="transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print-only Content - All pages */}
      <div className="hidden print:block print-area">
        {pages.map((pageProducts, pageIndex) => (
          <div
            key={pageIndex}
            className="barcode-sheet"
            style={{
              width: `${paperWidth}in`,
              minHeight: `${paperHeight}in`,
              padding: `${marginTop}in ${marginLeft}in`,
            }}
          >
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${barcodeSetting.stickers_in_one_row}, ${barcodeSetting.width}in)`,
                gap: `${barcodeSetting.row_distance}in ${barcodeSetting.col_distance}in`,
              }}
            >
              {pageProducts.map((product, index) => (
                <div
                  key={index}
                  className="barcode-label flex items-center justify-center overflow-hidden"
                  style={{
                    width: `${barcodeSetting.width}in`,
                    height: `${barcodeSetting.height}in`,
                  }}
                >
                  <div className="text-center">
                    {printSettings.print_business_name && (
                      <p style={{ fontWeight: "bold", fontSize: `${printSettings.print_business_name_size || 12}px` }}>
                        Your Business Name
                      </p>
                    )}
                    {printSettings.print_name && (
                      <p style={{ fontSize: `${printSettings.print_name_size || 11}px` }}>{product.name}</p>
                    )}
                    {printSettings.print_brand_name && product.brand_name && (
                      <p style={{ fontSize: `${printSettings.print_brand_name_size || 10}px` }}>{product.brand_name}</p>
                    )}
                    {printSettings.print_price && (
                      <p style={{ fontWeight: 600, fontSize: `${printSettings.print_price_size || 12}px` }}>
                        {formatPrice(product)}
                      </p>
                    )}
                    <Barcode
                      value={product.code}
                      width={1}
                      height={Math.floor(barcodeSetting.height * 0.24 * 96)}
                      fontSize={9}
                      displayValue={true}
                      margin={0}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
