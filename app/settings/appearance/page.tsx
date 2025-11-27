import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"
import { Header } from "@/components/layout/header"
import { Main } from "@/components/layout/main"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Search } from "@/components/search"
import { ThemeSwitch } from "@/components/theme-switch"
import { ConfigDrawer } from "@/components/config-drawer"
import { Settings } from "@/components/settings/settings"
import { AppearanceForm } from "@/components/settings/appearance/appearance-form"
import { ContentSection } from "@/components/settings/components/content-section"

export default async function AppearancePage() {
  const session = await auth()

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <AuthenticatedLayout>
      <Header>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <Settings>
          <ContentSection
            title="Appearance"
            desc="Customize the appearance of the app. Automatically switch between day and night themes."
          >
            <AppearanceForm />
          </ContentSection>
        </Settings>
      </Main>
    </AuthenticatedLayout>
  )
}
