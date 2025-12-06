"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiGetClient } from "@/lib/api-client-client"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import Image from "next/image"
import Barcode from "react-barcode"

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
  width: number
  height: number
  paper_width: number
  paper_height: number
  top_margin: number
  left_margin: number
  row_distance: number
  col_distance: number
  stickers_in_one_row: number
  is_continuous: boolean
  stickers_in_one_sheet: number
}

export function BarcodePreview() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [printSettings, setPrintSettings] = useState<Record<string, any>>({})
  const [barcodeSettingId, setBarcodeSettingId] = useState<number | null>(null)

  useEffect(() => {
    // Parse products from URL
    const productsData: Product[] = []
    let index = 0
    while (searchParams.has(`products[${index}][product_id]`)) {
      productsData.push({
        product_id: parseInt(searchParams.get(`products[${index}][product_id]`) || "0"),
        variant_id: searchParams.get(`products[${index}][variant_id]`) ? parseInt(searchParams.get(`products[${index}][variant_id]`)!) : undefined,
        name: searchParams.get(`products[${index}][name]`) || "",
        code: searchParams.get(`products[${index}][code]`) || "",
        qty: parseInt(searchParams.get(`products[${index}][qty]`) || "1"),
        image: searchParams.get(`products[${index}][image]`) || undefined,
        price: parseFloat(searchParams.get(`products[${index}][price]`) || "0"),
        promo_price: searchParams.get(`products[${index}][promo_price]`) ? parseFloat(searchParams.get(`products[${index}][promo_price]`)!) : undefined,
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
        settings[key] = value === "1" ? true : value
      }
    })
    setPrintSettings(settings)

    // Get barcode setting ID
    const settingId = searchParams.get("barcode_setting_id")
    if (settingId) {
      setBarcodeSettingId(parseInt(settingId))
    }
  }, [searchParams])

  // Fetch barcode setting details
  const { data: barcodeSetting, isLoading: isLoadingSetting } = useQuery<BarcodeSetting>({
    queryKey: ["barcode-setting", barcodeSettingId],
    queryFn: async () => {
      if (!barcodeSettingId) throw new Error("No barcode setting ID")
      const response = await apiGetClient<BarcodeSetting>(`barcodes/${barcodeSettingId}`)
      return response.data
    },
    enabled: !!barcodeSettingId,
  })

  // Generate barcode labels (repeat products by quantity)
  const labels = products.flatMap((product) =>
    Array.from({ length: product.qty }, () => product)
  )

  const handlePrint = () => {
    window.print()
  }

  if (isLoadingSetting || !barcodeSetting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
        <span className="ml-2">Loading barcode settings...</span>
      </div>
    )
  }

  // Calculate pages
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
  const paperHeight = barcodeSetting.is_continuous
    ? barcodeSetting.height
    : barcodeSetting.paper_height

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          @page {
            size: ${paperWidth}in ${paperHeight}in;
            margin-top: ${marginTop}in;
            margin-bottom: ${marginTop}in;
            margin-left: ${marginLeft}in;
            margin-right: ${marginLeft}in;
          }
          table {
            page-break-after: always;
          }
          td {
            border: none !important;
          }
        }
        td {
          border: 1px dotted lightgray;
        }
      `}</style>

      <div className="no-print fixed top-4 right-4 z-50">
        <Button onClick={handlePrint} size="lg">
          <Printer className="mr-2 h-5 w-5" />
          Print Barcodes
        </Button>
      </div>

      <div className="p-4">
        {pages.map((pageProducts, pageIndex) => (
          <table
            key={pageIndex}
            align="center"
            style={{
              borderSpacing: `${barcodeSetting.col_distance}in ${barcodeSetting.row_distance}in`,
              overflow: "hidden",
              width: "100%",
            }}
          >
            <tbody>
              {Array.from({
                length: Math.ceil(pageProducts.length / barcodeSetting.stickers_in_one_row),
              }).map((_, rowIndex) => {
                const rowProducts = pageProducts.slice(
                  rowIndex * barcodeSetting.stickers_in_one_row,
                  (rowIndex + 1) * barcodeSetting.stickers_in_one_row
                )

                return (
                  <tr key={rowIndex}>
                    {rowProducts.map((product, colIndex) => (
                      <td
                        key={colIndex}
                        align="center"
                        valign="middle"
                        style={{
                          width: `${barcodeSetting.width}in`,
                          height: `${barcodeSetting.height}in`,
                        }}
                      >
                        <div
                          style={{
                            overflow: "hidden",
                            display: "flex",
                            flexWrap: "wrap",
                            alignContent: "center",
                            width: `${barcodeSetting.width}in`,
                            height: `${barcodeSetting.height}in`,
                            justifyContent: "center",
                          }}
                        >
                          <div style={{ textAlign: "center" }}>
                            {/* Business Name */}
                            {printSettings.print_business_name && (
                              <span
                                style={{
                                  display: "block",
                                  fontWeight: "bold",
                                  fontSize: `${printSettings.print_business_name_size || 15}px`,
                                }}
                              >
                                Your Business Name
                              </span>
                            )}

                            {/* Product Name */}
                            {printSettings.print_name && (
                              <span
                                style={{
                                  display: "block",
                                  fontSize: `${printSettings.print_name_size || 15}px`,
                                }}
                              >
                                {product.name}
                              </span>
                            )}

                            {/* Brand Name */}
                            {printSettings.print_brand_name && product.brand_name && (
                              <span
                                style={{
                                  display: "block",
                                  fontSize: `${printSettings.print_brand_name_size || 15}px`,
                                }}
                              >
                                {product.brand_name}
                              </span>
                            )}

                            {/* Price */}
                            {printSettings.print_price && (
                              <span
                                style={{
                                  display: "block",
                                  fontSize: `${printSettings.print_price_size || 15}px`,
                                }}
                              >
                                {printSettings.print_promo_price && product.promo_price ? (
                                  <>
                                    {product.currency_position === "prefix" && (
                                      <span style={{ fontSize: "11px" }}>{product.currency}</span>
                                    )}{" "}
                                    <span style={{ textDecoration: "line-through" }}>
                                      {product.price.toFixed(2)}
                                    </span>{" "}
                                    {product.promo_price.toFixed(2)}
                                    {product.currency_position === "suffix" && (
                                      <span style={{ fontSize: "11px" }}> {product.currency}</span>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {product.currency_position === "prefix" && (
                                      <span style={{ fontSize: "11px" }}>{product.currency}</span>
                                    )}{" "}
                                    {product.price.toFixed(2)}
                                    {product.currency_position === "suffix" && (
                                      <span style={{ fontSize: "11px" }}> {product.currency}</span>
                                    )}
                                  </>
                                )}
                              </span>
                            )}

                            {/* Barcode */}
                            <div style={{ margin: "5px 0" }}>
                              <Barcode
                                value={product.code}
                                width={1}
                                height={Math.floor(barcodeSetting.height * 0.24 * 96)}
                                fontSize={10}
                                displayValue={true}
                                margin={0}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        ))}
      </div>
    </>
  )
}

