import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Header } from "@/components/layout/header"
import { Main } from "@/components/layout/main"
import { Search } from "@/components/search"
import { ThemeSwitch } from "@/components/theme-switch"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"
import { ConfigDrawer } from "@/components/config-drawer"
import { PrintBarcodeForm } from "@/components/products/components/print-barcode-form"

interface PrintBarcodePageProps {
  searchParams: Promise<{
    product?: string
  }>
}

export default async function PrintBarcodePage({ searchParams }: PrintBarcodePageProps) {
  const session = await auth()

  if (!session) {
    redirect("/sign-in")
  }

  const { product } = await searchParams
  const preloadedProduct = product || null

  return (
    <AuthenticatedLayout>
      <Header fixed>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Print Barcode</h2>
          <p className="text-muted-foreground">
            Select products and generate barcode labels
          </p>
        </div>
        <PrintBarcodeForm preloadedProduct={preloadedProduct} />
      </Main>
    </AuthenticatedLayout>
  )
}
