/**
 * Sidebar Filter Utility
 *
 * Filters sidebar items based on user permissions.
 * Super admin and admin roles see all items.
 */

import { type Session } from "next-auth"
import { type SidebarData, type NavGroup, type NavItem } from "@/components/layout/types"
import { canAccessRoute, isAdmin } from "./permissions"

/**
 * Filter sidebar data based on user permissions
 */
export function filterSidebarData(
  sidebarData: SidebarData,
  session: Session | null
): SidebarData {
  // Admin roles see everything
  if (isAdmin(session)) {
    return sidebarData
  }

  // Filter nav groups
  const filteredNavGroups = sidebarData.navGroups
    .map((group) => filterNavGroup(group, session))
    .filter((group) => group.items.length > 0) // Remove empty groups

  return {
    ...sidebarData,
    navGroups: filteredNavGroups,
  }
}

/**
 * Filter a nav group
 */
function filterNavGroup(
  group: NavGroup,
  session: Session | null
): NavGroup {
  const filteredItems = group.items
    .map((item) => filterNavItem(item, session))
    .filter((item): item is NavItem => item !== null)

  return {
    ...group,
    items: filteredItems,
  }
}

/**
 * Filter a nav item (link or collapsible)
 */
function filterNavItem(
  item: NavItem,
  session: Session | null
): NavItem | null {
  // If it's a link, check if user can access the route
  if ("url" in item && item.url) {
    if (!canAccessRoute(session, item.url)) {
      return null
    }
    return item
  }

  // If it's a collapsible, filter its items
  if ("items" in item && item.items) {
    const filteredSubItems = item.items
      .filter((subItem) => canAccessRoute(session, subItem.url))
      .map((subItem) => ({ ...subItem }))

    // If no sub-items remain, hide the parent
    if (filteredSubItems.length === 0) {
      return null
    }

    return {
      ...item,
      items: filteredSubItems,
    }
  }

  return item
}

