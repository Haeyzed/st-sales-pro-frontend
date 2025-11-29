"use client"

import { useSession } from "next-auth/react"
import {
  canPerformAction,
  canAccessRoute,
  hasPermission,
  hasAnyPermission,
} from "@/lib/permissions"
import type { Session } from "next-auth"

interface PermissionGateProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  permission?: string
  permissions?: string[]
  action?: string
  route?: string
  requireAll?: boolean // If true, requires all permissions; if false, requires any
}

/**
 * PermissionGate Component
 *
 * Conditionally renders children based on user permissions.
 * Super admin and admin roles always have access.
 *
 * @example
 * <PermissionGate permission="view categories">
 *   <Button>View Categories</Button>
 * </PermissionGate>
 *
 * @example
 * <PermissionGate action="categories:create">
 *   <Button>Create Category</Button>
 * </PermissionGate>
 *
 * @example
 * <PermissionGate permissions={["view categories", "view products"]} requireAll={false}>
 *   <Button>View</Button>
 * </PermissionGate>
 */
export function PermissionGate({
  children,
  fallback = null,
  permission,
  permissions,
  action,
  route,
  requireAll = false,
}: PermissionGateProps) {
  const { data: session } = useSession()

  let hasAccess = false

  if (action) {
    hasAccess = canPerformAction(session, action)
  } else if (route) {
    hasAccess = canAccessRoute(session, route)
  } else if (permissions && permissions.length > 0) {
    if (requireAll) {
      hasAccess = permissions.every((p) =>
        hasPermission(session, p)
      )
    } else {
      hasAccess = hasAnyPermission(session, permissions)
    }
  } else if (permission) {
    hasAccess = hasPermission(session, permission)
  } else {
    // If no permission check specified, show by default
    hasAccess = true
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

/**
 * Server-side PermissionGate
 * For use in server components
 */
export async function ServerPermissionGate({
  children,
  fallback = null,
  session,
  permission,
  permissions,
  action,
  route,
  requireAll = false,
}: PermissionGateProps & { session: Session | null }) {
  const {
    canPerformAction,
    canAccessRoute,
    hasPermission,
    hasAnyPermission,
  } = await import("@/lib/permissions")

  let hasAccess = false

  if (action) {
    hasAccess = canPerformAction(session, action)
  } else if (route) {
    hasAccess = canAccessRoute(session, route)
  } else if (permissions && permissions.length > 0) {
    if (requireAll) {
      hasAccess = permissions.every((p) => hasPermission(session, p))
    } else {
      hasAccess = hasAnyPermission(session, permissions)
    }
  } else if (permission) {
    hasAccess = hasPermission(session, permission)
  } else {
    hasAccess = true
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

