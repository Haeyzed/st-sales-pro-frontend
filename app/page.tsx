import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SiteLayout } from "@/components/layout/site-layout"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteMain } from "@/components/layout/site-main"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Search } from "@/components/search"
import { ThemeSwitch } from "@/components/theme-switch"
import { ComingSoon } from "@/components/coming-soon"

export default async function HomePage() {
  const session = await auth()

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <SiteLayout>
      {/* ===== Top Heading ===== */}
      <SiteHeader fixed>
        <div className="flex items-center space-x-4">
          {/* <Search /> */}
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </SiteHeader>

      {/* ===== Main ===== */}
      <SiteMain>
        <ComingSoon title="Welcome to ST Sales Pro" />
      </SiteMain>
    </SiteLayout>
  )
}
