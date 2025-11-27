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
import { DisplayForm } from "@/components/settings/display/display-form"
import { ContentSection } from "@/components/settings/components/content-section"

export default async function DisplayPage() {
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
            title="Display"
            desc="Turn items on or off to control what's displayed in the app."
          >
            <DisplayForm />
          </ContentSection>
        </Settings>
      </Main>
    </AuthenticatedLayout>
  )
}
