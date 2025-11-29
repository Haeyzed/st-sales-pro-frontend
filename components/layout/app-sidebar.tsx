"use client"

import { useLayout } from "@/context/layout-provider"
import { useSession } from "next-auth/react"
import { useMemo } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { sidebarData } from "./sidebar-data"
import { NavGroup } from "./nav-group"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import { filterSidebarData } from "@/lib/filter-sidebar"

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { data: session } = useSession()

  // Filter sidebar data based on user permissions
  const filteredSidebarData = useMemo(() => {
    return filterSidebarData(sidebarData, session)
  }, [session])

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={filteredSidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {filteredSidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={filteredSidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
