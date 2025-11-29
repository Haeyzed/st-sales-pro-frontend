/**
 * Route Protection Utilities
 *
 * Provides utilities for protecting routes based on permissions.
 */

import { redirect } from "next/navigation"
import { type Session } from "next-auth"
import { canAccessRoute } from "./permissions"

/**
 * Protect a route based on permissions
 * Redirects to forbidden page if user doesn't have access
 */
export function protectRoute(session: Session | null, route: string): void {
  if (!canAccessRoute(session, route)) {
    redirect("/errors/forbidden")
  }
}

/**
 * Get required permission for a route
 */
export function getRoutePermission(route: string): string | string[] | null {
  const { routePermissions } = require("./permissions")
  return routePermissions[route] || null
}

