/**
 * Permission Utility Functions
 *
 * Provides utilities for checking user permissions and roles.
 * Super admin and admin roles have full access to everything.
 */

import { type Session } from "next-auth"

// Admin roles that have full access
const ADMIN_ROLES = ["super admin", "admin"]

// Route to permission mapping based on ACL config
export const routePermissions: Record<string, string | string[]> = {
  // Dashboard
  "/dashboard": "view products", // Default permission, adjust as needed

  // Products
  "/products/category": "view categories",
  "/products": "view products",
  "/products/create": "create products",
  "/products/print-barcode": "view products",
  "/products/adjustment": "view adjustments",
  "/products/adjustment/create": "create adjustments",
  "/products/stock-count": "view products",

  // Purchases
  "/purchases": "view products", // Adjust based on your needs
  "/purchases/create": "create products",
  "/purchases/import-csv": "create products",

  // Sales
  "/sales": "view products",
  "/pos": "view products",
  "/sales/create": "create products",
  "/sales/import-csv": "create products",
  "/sales/packing-slips": "view deliveries",
  "/sales/challans": "view deliveries",
  "/sales/delivery": "view deliveries",
  "/sales/gift-cards": "view gift cards",
  "/sales/coupons": "view coupons",
  "/sales/couriers": "view deliveries",

  // Expenses
  "/expenses/categories": "view expense categories",
  "/expenses": "view expenses",
  "/expenses/create": "create expenses",

  // Quotations
  "/quotations": "view products",
  "/quotations/create": "create products",

  // Transfers
  "/transfers": "view products",
  "/transfers/create": "create products",
  "/transfers/import-csv": "create products",

  // Returns
  "/returns/sale": "view products",
  "/returns/purchase": "view products",

  // Accounting
  "/accounting/accounts": "view accounts",
  "/accounting/accounts/create": "create accounts",
  "/accounting/money-transfers": "view accounts",
  "/accounting/balance-sheet": "view balance sheet",
  "/accounting/account-statement": "view account statements",

  // HRM
  "/hrm/departments": "view departments",
  "/hrm/employees": "view employees",
  "/hrm/attendance": "view attendances",
  "/hrm/payroll": "view employees", // Adjust as needed
  "/hrm/holidays": "view holidays",

  // People
  "/people/users": "view roles", // Adjust as needed
  "/people/users/create": "create roles",
  "/people/customers": "view customers",
  "/people/customers/create": "create customers",
  "/people/billers": "view billers",
  "/people/billers/create": "create billers",
  "/people/suppliers": "view suppliers",
  "/people/suppliers/create": "create suppliers",

  // Reports - most reports don't have specific permissions, using view products as default
  "/reports/activity-log": "view products",
  "/reports/summary": "view products",
  "/reports/best-seller": "view products",
  "/reports/product": "view products",
  "/reports/daily-sale": "view products",
  "/reports/monthly-sale": "view products",
  "/reports/daily-purchase": "view products",
  "/reports/monthly-purchase": "view products",
  "/reports/sale": "view products",
  "/reports/challan": "view deliveries",
  "/reports/sale-chart": "view products",
  "/reports/payment": "view products",
  "/reports/purchase": "view products",
  "/reports/customer": "view customers",
  "/reports/customer-group": "view customer groups",
  "/reports/customer-due": "view customers",
  "/reports/supplier": "view suppliers",
  "/reports/supplier-due": "view suppliers",
  "/reports/warehouse": "view warehouses",
  "/reports/warehouse-stock": "view warehouses",
  "/reports/product-expiry": "view products",
  "/reports/product-quantity-alert": "view products",
  "/reports/daily-sale-objective": "view products",
  "/reports/user": "view roles",
  "/reports/cash-register": "view cash registers",

  // Manufacturing
  "/manufacturing/productions": "view products",
  "/manufacturing/productions/create": "create products",
  "/manufacturing/recipes": "view products",

  // Settings
  "/settings/printers": "view printers",
  "/settings/invoice": "view products",
  "/settings/role-permission": "view roles",
  "/settings/sms-template": "view products",
  "/settings/custom-fields": "view products",
  "/settings/discount-plan": "view discount plans",
  "/settings/discount": "view products",
  "/settings/notifications": "view products",
  "/settings/send-notification": "view products",
  "/settings/warehouse": "view warehouses",
  "/settings/tables": "view tables",
  "/settings/customer-group": "view customer groups",
  "/settings/brand": "view brands",
  "/settings/unit": "view units",
  "/settings/currency": "view currencies",
  "/settings/tax": "view taxes",
  "/settings/create-sms": "view products",
  "/settings/backup": "view products",
  "/settings/general": "view products",
  "/settings/mail": "view products",
  "/settings/reward-point": "view products",
  "/settings/sms": "view products",
  "/settings/payment-gateways": "view products",
  "/settings/pos": "view products",
  "/settings/hrm": "view products",
  "/settings/barcode": "view products",
  "/settings/languages": "view products",

  // E-commerce
  "/woocommerce": "view products",
  "/ecommerce/sliders": "view products",
  "/ecommerce/menu": "view products",
  "/ecommerce/collections": "view products",
  "/ecommerce/pages": "view products",
  "/ecommerce/widgets": "view products",
  "/ecommerce/faq-categories": "view products",
  "/ecommerce/faqs": "view products",
  "/ecommerce/social-links": "view products",
  "/ecommerce/blog": "view products",
  "/ecommerce/payment-gateways": "view products",
  "/ecommerce/settings": "view products",
  "/ecommerce/product-review": "view products",

  // Support
  "/support/tickets": "view products",

  // Help
  "/help-center": "view products",
}

// Action permissions mapping
export const actionPermissions: Record<string, string> = {
  // Category actions
  "categories:create": "create categories",
  "categories:update": "update categories",
  "categories:delete": "delete categories",
  "categories:view": "view categories",

  // Product actions
  "products:create": "create products",
  "products:update": "update products",
  "products:delete": "delete products",
  "products:view": "view products",

  // Customer actions
  "customers:create": "create customers",
  "customers:update": "update customers",
  "customers:delete": "delete customers",
  "customers:view": "view customers",

  // Supplier actions
  "suppliers:create": "create suppliers",
  "suppliers:update": "update suppliers",
  "suppliers:delete": "delete suppliers",
  "suppliers:view": "view suppliers",

  // Account actions
  "accounts:create": "create accounts",
  "accounts:update": "update accounts",
  "accounts:delete": "delete accounts",
  "accounts:view": "view accounts",

  // Adjustment actions
  "adjustments:create": "create adjustments",
  "adjustments:update": "update adjustments",
  "adjustments:delete": "delete adjustments",
  "adjustments:view": "view adjustments",

  // Attendance actions
  "attendances:create": "create attendances",
  "attendances:update": "update attendances",
  "attendances:delete": "delete attendances",
  "attendances:view": "view attendances",

  // Expense actions
  "expenses:create": "create expenses",
  "expenses:update": "update expenses",
  "expenses:delete": "delete expenses",
  "expenses:view": "view expenses",

  // Income actions
  "incomes:create": "create incomes",
  "incomes:update": "update incomes",
  "incomes:delete": "delete incomes",
  "incomes:view": "view incomes",

  // Brand actions
  "brands:create": "create brands",
  "brands:update": "update brands",
  "brands:delete": "delete brands",
  "brands:view": "view brands",

  // Warehouse actions
  "warehouses:create": "create warehouses",
  "warehouses:update": "update warehouses",
  "warehouses:delete": "delete warehouses",
  "warehouses:view": "view warehouses",

  // Tax actions
  "taxes:create": "create taxes",
  "taxes:update": "update taxes",
  "taxes:delete": "delete taxes",
  "taxes:view": "view taxes",

  // Unit actions
  "units:create": "create units",
  "units:update": "update units",
  "units:delete": "delete units",
  "units:view": "view units",

  // Variant actions
  "variants:create": "create variants",
  "variants:update": "update variants",
  "variants:delete": "delete variants",
  "variants:view": "view variants",

  // Employee actions
  "employees:create": "create employees",
  "employees:update": "update employees",
  "employees:delete": "delete employees",
  "employees:view": "view employees",

  // Department actions
  "departments:create": "create departments",
  "departments:update": "update departments",
  "departments:delete": "delete departments",
  "departments:view": "view departments",

  // Holiday actions
  "holidays:create": "create holidays",
  "holidays:update": "update holidays",
  "holidays:delete": "delete holidays",
  "holidays:view": "view holidays",
  "holidays:approve": "approve holidays",

  // Table actions
  "tables:create": "create tables",
  "tables:update": "update tables",
  "tables:delete": "delete tables",
  "tables:view": "view tables",

  // Printer actions
  "printers:create": "create printers",
  "printers:update": "update printers",
  "printers:delete": "delete printers",
  "printers:view": "view printers",

  // Coupon actions
  "coupons:create": "create coupons",
  "coupons:update": "update coupons",
  "coupons:delete": "delete coupons",
  "coupons:view": "view coupons",

  // Gift Card actions
  "gift-cards:create": "create gift cards",
  "gift-cards:update": "update gift cards",
  "gift-cards:delete": "delete gift cards",
  "gift-cards:view": "view gift cards",
  "gift-cards:recharge": "recharge gift cards",

  // Delivery actions
  "deliveries:create": "create deliveries",
  "deliveries:update": "update deliveries",
  "deliveries:delete": "delete deliveries",
  "deliveries:view": "view deliveries",
  "deliveries:view-all": "view all deliveries",
  "deliveries:send-email": "send delivery emails",

  // Role actions
  "roles:create": "create roles",
  "roles:update": "update roles",
  "roles:delete": "delete roles",
  "roles:view": "view roles",
  "roles:assign": "assign roles",

  // Permission actions
  "permissions:create": "create permissions",
  "permissions:update": "update permissions",
  "permissions:delete": "delete permissions",
  "permissions:view": "view permissions",
  "permissions:assign": "assign permissions",

  // Biller actions
  "billers:create": "create billers",
  "billers:update": "update billers",
  "billers:delete": "delete billers",
  "billers:view": "view billers",

  // Discount Plan actions
  "discount-plans:create": "create discount plans",
  "discount-plans:update": "update discount plans",
  "discount-plans:delete": "delete discount plans",
  "discount-plans:view": "view discount plans",

  // Currency actions
  "currencies:create": "create currencies",
  "currencies:update": "update currencies",
  "currencies:delete": "delete currencies",
  "currencies:view": "view currencies",

  // Customer Group actions
  "customer-groups:create": "create customer groups",
  "customer-groups:update": "update customer groups",
  "customer-groups:delete": "delete customer groups",
  "customer-groups:view": "view customer groups",

  // Expense Category actions
  "expense-categories:create": "create expense categories",
  "expense-categories:update": "update expense categories",
  "expense-categories:delete": "delete expense categories",
  "expense-categories:view": "view expense categories",

  // Income Category actions
  "income-categories:create": "create income categories",
  "income-categories:update": "update income categories",
  "income-categories:delete": "delete income categories",
  "income-categories:view": "view income categories",
}

/**
 * Check if user has a specific role
 */
export function hasRole(session: Session | null, role: string): boolean {
  if (!session?.user) return false

  const userRoles = (session.user as any).roles || []
  return userRoles.some(
    (r: string) => r.toLowerCase() === role.toLowerCase()
  )
}

/**
 * Check if user is admin (super admin or admin)
 */
export function isAdmin(session: Session | null): boolean {
  if (!session?.user) return false

  const userRoles = (session.user as any).roles || []
  return userRoles.some((role: string) =>
    ADMIN_ROLES.includes(role.toLowerCase())
  )
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  session: Session | null,
  permission: string
): boolean {
  if (!session?.user) return false

  // Admin roles have all permissions
  if (isAdmin(session)) return true

  const userPermissions = (session.user as any).permissions || []
  return userPermissions.includes(permission)
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  session: Session | null,
  permissions: string[]
): boolean {
  if (!session?.user) return false

  // Admin roles have all permissions
  if (isAdmin(session)) return true

  if (permissions.length === 0) return true

  const userPermissions = (session.user as any).permissions || []
  return permissions.some((permission) => userPermissions.includes(permission))
}

/**
 * Check if user can access a route
 */
export function canAccessRoute(
  session: Session | null,
  route: string
): boolean {
  if (!session?.user) return false

  // Admin roles can access everything
  if (isAdmin(session)) return true

  const requiredPermission = routePermissions[route]

  if (!requiredPermission) {
    // If route is not in mapping, allow access (for backward compatibility)
    // You may want to change this to false for stricter control
    return true
  }

  if (Array.isArray(requiredPermission)) {
    return hasAnyPermission(session, requiredPermission)
  }

  return hasPermission(session, requiredPermission)
}

/**
 * Check if user can perform an action
 */
export function canPerformAction(
  session: Session | null,
  action: string
): boolean {
  if (!session?.user) return false

  // Admin roles can perform all actions
  if (isAdmin(session)) return true

  const requiredPermission = actionPermissions[action]

  if (!requiredPermission) {
    // If action is not in mapping, deny access for safety
    return false
  }

  return hasPermission(session, requiredPermission)
}

