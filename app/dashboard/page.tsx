import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"
import { Header } from "@/components/layout/header"
import { Main } from "@/components/layout/main"
import { TopNav } from "@/components/layout/top-nav"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Search } from "@/components/search"
import { ThemeSwitch } from "@/components/theme-switch"
import { ConfigDrawer } from "@/components/config-drawer"
import { ShortcutsPopover } from "@/components/shortcuts-popover"
import { Dashboard } from "@/components/dashboard/dashboard"

const topNav = [
  {
    title: "Overview",
    href: "/dashboard",
    isActive: true,
    disabled: false,
  },
  {
    title: "Customers",
    href: "/dashboard/customers",
    isActive: false,
    disabled: true,
  },
  {
    title: "Products",
    href: "/dashboard/products",
    isActive: false,
    disabled: true,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    isActive: false,
    disabled: true,
  },
]

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <AuthenticatedLayout>
      {/* ===== Top Heading ===== */}
      <Header fixed>
        <TopNav links={topNav} />
        <div className="ms-auto flex items-center space-x-4">
          <ShortcutsPopover />
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <Dashboard />
      </Main>
    </AuthenticatedLayout>
  )
}
