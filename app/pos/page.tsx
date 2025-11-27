import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SiteLayout } from "@/components/layout/site-layout"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteMain } from "@/components/layout/site-main"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { ThemeSwitch } from "@/components/theme-switch"
import { ComingSoon } from "@/components/coming-soon"

export default async function PosPage() {
  const session = await auth()

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <SiteLayout>
      <SiteHeader fixed>
        <div className="flex items-center space-x-4">
          {/* <ThemeSwitch />
          <ProfileDropdown /> */}
        </div>
      </SiteHeader>

      <SiteMain fixed>
        <ComingSoon title="POS" />
      </SiteMain>
    </SiteLayout>
  )
}
