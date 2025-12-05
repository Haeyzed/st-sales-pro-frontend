import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"
import { Header } from "@/components/layout/header"
import { Main } from "@/components/layout/main"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Search } from "@/components/search"
import { ThemeSwitch } from "@/components/theme-switch"
import { ConfigDrawer } from "@/components/config-drawer"
import { Units } from "@/components/units/units"
import { protectRoute } from "@/lib/route-protection"

export default async function UnitsPage() {
  const session = await auth()

  if (!session) {
    redirect("/sign-in")
  }

  // Protect route based on permissions
  protectRoute(session, "/products/units")

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
        <Units />
      </Main>
    </AuthenticatedLayout>
  )
}
