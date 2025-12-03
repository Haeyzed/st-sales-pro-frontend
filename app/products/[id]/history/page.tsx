import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"
import { Header } from "@/components/layout/header"
import { Main } from "@/components/layout/main"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Search } from "@/components/search"
import { ThemeSwitch } from "@/components/theme-switch"
import { ConfigDrawer } from "@/components/config-drawer"
import { ProductHistory } from "@/components/products/history/product-history"

interface ProductHistoryPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProductHistoryPage({
  params,
}: ProductHistoryPageProps) {
  const session = await auth()

  if (!session) {
    redirect("/sign-in")
  }

  const { id } = await params
  const productId = parseInt(id, 10)

  if (isNaN(productId)) {
    redirect("/products")
  }

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
        <ProductHistory productId={productId} />
      </Main>
    </AuthenticatedLayout>
  )
}
