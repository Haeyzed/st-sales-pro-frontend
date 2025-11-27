"use client"

import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
  ListTodo,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Package,
  Palette,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
  Users,
  MessagesSquare,
  ShieldCheck,
  Command,
  GalleryVerticalEnd,
  AudioWaveform,
  ShoppingCart,
  Receipt,
  DollarSign,
  FileText,
  Truck,
  RotateCcw,
  Calculator,
  Briefcase,
  FileBarChart,
  Factory,
  ShoppingBag,
  Store,
  Headphones,
  FolderTree,
  Plus,
  Barcode,
  Archive,
  LayoutList,
  BarChart3,
  TrendingUp,
  Calendar,
  CreditCard,
  Building2,
  UserCircle,
  Tag,
  Boxes,
  Layers,
  Image,
  Menu,
  BookOpen,
  Link,
  Newspaper,
  Star,
  Printer,
  ClipboardList,
  Wallet,
  FolderOpen,
  Globe,
  MessageCircle,
  Activity,
  AlertCircle,
  PieChart,
  Warehouse,
  PackageSearch,
  Clock,
  Target,
  UserCheck,
  Phone,
  Mail,
  Database,
  Coins,
  ScanLine,
  Languages,
  Ticket,
} from "lucide-react"
import { type SidebarData } from "./types"

// Default sidebar data - will be overridden by session data in NavUser component
export const sidebarData: SidebarData = {
  user: {
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/default.jpg",
  },
  teams: [
    {
      name: "ST Sales Pro",
      logo: Command,
      plan: "Next.js + ShadCN",
    },
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
  ],
  navGroups: [
    {
      title: "General",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Product",
          icon: Package,
          items: [
            {
              title: "Category",
              url: "/products/category",
            },
            {
              title: "Product List",
              url: "/products",
            },
            {
              title: "Add Product",
              url: "/products/create",
            },
            {
              title: "Print Barcode",
              url: "/products/print-barcode",
            },
            {
              title: "Adjustment List",
              url: "/products/adjustment",
            },
            {
              title: "Add Adjustment",
              url: "/products/adjustment/create",
            },
            {
              title: "Stock Count",
              url: "/products/stock-count",
            },
          ],
        },
        {
          title: "Purchase",
          icon: ShoppingCart,
          items: [
            {
              title: "Purchase List",
              url: "/purchases",
            },
            {
              title: "Add Purchase",
              url: "/purchases/create",
            },
            {
              title: "Import Purchase By CSV",
              url: "/purchases/import-csv",
            },
          ],
        },
        {
          title: "Sale",
          icon: Receipt,
          items: [
            {
              title: "Sale List",
              url: "/sales",
            },
            {
              title: "POS",
              url: "/pos",
            },
            {
              title: "Add Sale",
              url: "/sales/create",
            },
            {
              title: "Import Sale By CSV",
              url: "/sales/import-csv",
            },
            {
              title: "Packing Slip List",
              url: "/sales/packing-slips",
            },
            {
              title: "Challan List",
              url: "/sales/challans",
            },
            {
              title: "Delivery List",
              url: "/sales/delivery",
            },
            {
              title: "Gift Card List",
              url: "/sales/gift-cards",
            },
            {
              title: "Coupon List",
              url: "/sales/coupons",
            },
            {
              title: "Courier List",
              url: "/sales/couriers",
            },
          ],
        },
        {
          title: "Expense",
          icon: DollarSign,
          items: [
            {
              title: "Expense Category",
              url: "/expenses/categories",
            },
            {
              title: "Expense List",
              url: "/expenses",
            },
            {
              title: "Add Expense",
              url: "/expenses/create",
            },
          ],
        },
        {
          title: "Quotation",
          icon: FileText,
          items: [
            {
              title: "Quotation List",
              url: "/quotations",
            },
            {
              title: "Add Quotation",
              url: "/quotations/create",
            },
          ],
        },
        {
          title: "Transfer",
          icon: Truck,
          items: [
            {
              title: "Transfer List",
              url: "/transfers",
            },
            {
              title: "Add Transfer",
              url: "/transfers/create",
            },
            {
              title: "Import Transfer By CSV",
              url: "/transfers/import-csv",
            },
          ],
        },
        {
          title: "Return",
          icon: RotateCcw,
          items: [
            {
              title: "Sale Return",
              url: "/returns/sale",
            },
            {
              title: "Purchase Return",
              url: "/returns/purchase",
            },
          ],
        },
      ],
    },
    {
      title: "Business",
      items: [
        {
          title: "Accounting",
          icon: Calculator,
          items: [
            {
              title: "Account List",
              url: "/accounting/accounts",
            },
            {
              title: "Add Account",
              url: "/accounting/accounts/create",
            },
            {
              title: "Money Transfer",
              url: "/accounting/money-transfers",
            },
            {
              title: "Balance Sheet",
              url: "/accounting/balance-sheet",
            },
            {
              title: "Account Statement",
              url: "/accounting/account-statement",
            },
          ],
        },
        {
          title: "HRM",
          icon: Briefcase,
          items: [
            {
              title: "Department",
              url: "/hrm/departments",
            },
            {
              title: "Employee",
              url: "/hrm/employees",
            },
            {
              title: "Attendance",
              url: "/hrm/attendance",
            },
            {
              title: "Payroll",
              url: "/hrm/payroll",
            },
            {
              title: "Holiday",
              url: "/hrm/holidays",
            },
          ],
        },
        {
          title: "People",
          icon: Users,
          items: [
            {
              title: "User List",
              url: "/people/users",
            },
            {
              title: "Add User",
              url: "/people/users/create",
            },
            {
              title: "Customer List",
              url: "/people/customers",
            },
            {
              title: "Add Customer",
              url: "/people/customers/create",
            },
            {
              title: "Biller List",
              url: "/people/billers",
            },
            {
              title: "Add Biller",
              url: "/people/billers/create",
            },
            {
              title: "Supplier List",
              url: "/people/suppliers",
            },
            {
              title: "Add Supplier",
              url: "/people/suppliers/create",
            },
          ],
        },
        {
          title: "Reports",
          icon: FileBarChart,
          items: [
            {
              title: "Activity Log",
              url: "/reports/activity-log",
            },
            {
              title: "Summary Report",
              url: "/reports/summary",
            },
            {
              title: "Best Seller",
              url: "/reports/best-seller",
            },
            {
              title: "Product Report",
              url: "/reports/product",
            },
            {
              title: "Daily Sale",
              url: "/reports/daily-sale",
            },
            {
              title: "Monthly Sale",
              url: "/reports/monthly-sale",
            },
            {
              title: "Daily Purchase",
              url: "/reports/daily-purchase",
            },
            {
              title: "Monthly Purchase",
              url: "/reports/monthly-purchase",
            },
            {
              title: "Sale Report",
              url: "/reports/sale",
            },
            {
              title: "Challan Report",
              url: "/reports/challan",
            },
            {
              title: "Sale Report Chart",
              url: "/reports/sale-chart",
            },
            {
              title: "Payment Report",
              url: "/reports/payment",
            },
            {
              title: "Purchase Report",
              url: "/reports/purchase",
            },
            {
              title: "Customer Report",
              url: "/reports/customer",
            },
            {
              title: "Customer Group Report",
              url: "/reports/customer-group",
            },
            {
              title: "Customer Due Report",
              url: "/reports/customer-due",
            },
            {
              title: "Supplier Report",
              url: "/reports/supplier",
            },
            {
              title: "Supplier Due Report",
              url: "/reports/supplier-due",
            },
            {
              title: "Warehouse Report",
              url: "/reports/warehouse",
            },
            {
              title: "Warehouse Stock Chart",
              url: "/reports/warehouse-stock",
            },
            {
              title: "Product Expiry Report",
              url: "/reports/product-expiry",
            },
            {
              title: "Product Quantity Alert",
              url: "/reports/product-quantity-alert",
            },
            {
              title: "Daily Sale Objective Report",
              url: "/reports/daily-sale-objective",
            },
            {
              title: "User Report",
              url: "/reports/user",
            },
            {
              title: "Cash Register",
              url: "/reports/cash-register",
            },
          ],
        },
        {
          title: "Manufacturing",
          icon: Factory,
          items: [
            {
              title: "Production List",
              url: "/manufacturing/productions",
            },
            {
              title: "Add Production",
              url: "/manufacturing/productions/create",
            },
            {
              title: "Recipe",
              url: "/manufacturing/recipes",
            },
          ],
        },
      ],
    },
    {
      title: "E-commerce",
      items: [
        {
          title: "WooCommerce",
          url: "/woocommerce",
          icon: ShoppingBag,
        },
        {
          title: "eCommerce",
          icon: Store,
          items: [
            {
              title: "Sliders",
              url: "/ecommerce/sliders",
            },
            {
              title: "Menu",
              url: "/ecommerce/menu",
            },
            {
              title: "Collections",
              url: "/ecommerce/collections",
            },
            {
              title: "Pages",
              url: "/ecommerce/pages",
            },
            {
              title: "Widgets",
              url: "/ecommerce/widgets",
            },
            {
              title: "Faq Category",
              url: "/ecommerce/faq-categories",
            },
            {
              title: "Faqs",
              url: "/ecommerce/faqs",
            },
            {
              title: "Social Links",
              url: "/ecommerce/social-links",
            },
            {
              title: "Blog",
              url: "/ecommerce/blog",
            },
            {
              title: "Payment Gateways",
              url: "/ecommerce/payment-gateways",
            },
            {
              title: "Settings",
              url: "/ecommerce/settings",
            },
            {
              title: "Product Review",
              url: "/ecommerce/product-review",
            },
          ],
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          title: "Support Tickets",
          url: "/support/tickets",
          icon: Ticket,
        },
      ],
    },
    // {
    //   title: "Pages",
    //   items: [
    //     {
    //       title: "Tasks",
    //       url: "/tasks",
    //       icon: ListTodo,
    //     },
    //     {
    //       title: "Apps",
    //       url: "/apps",
    //       icon: Package,
    //     },
    //     {
    //       title: "Chats",
    //       url: "/chats",
    //       badge: "3",
    //       icon: MessagesSquare,
    //     },
    //     {
    //       title: "Users",
    //       url: "/users",
    //       icon: Users,
    //     },
    //     {
    //       title: "Auth",
    //       icon: ShieldCheck,
    //       items: [
    //         {
    //           title: "Sign In",
    //           url: "/sign-in",
    //         },
    //         {
    //           title: "Sign Up",
    //           url: "/sign-up",
    //         },
    //         {
    //           title: "Forgot Password",
    //           url: "/forgot-password",
    //         },
    //         {
    //           title: "OTP",
    //           url: "/otp",
    //         },
    //       ],
    //     },
    //     {
    //       title: "Errors",
    //       icon: Bug,
    //       items: [
    //         {
    //           title: "Unauthorized",
    //           url: "/errors/unauthorized",
    //           icon: Lock,
    //         },
    //         {
    //           title: "Forbidden",
    //           url: "/errors/forbidden",
    //           icon: UserX,
    //         },
    //         {
    //           title: "Not Found",
    //           url: "/errors/not-found",
    //           icon: FileX,
    //         },
    //         {
    //           title: "Internal Server Error",
    //           url: "/errors/internal-server-error",
    //           icon: ServerOff,
    //         },
    //         {
    //           title: "Maintenance Error",
    //           url: "/errors/maintenance-error",
    //           icon: Construction,
    //         },
    //       ],
    //     },
    //   ],
    // },
    {
      title: "Settings",
      items: [
        {
          title: "Settings",
          icon: Settings,
          items: [
            {
              title: "Receipt Printers",
              url: "/settings/printers",
            },
            {
              title: "Invoice Settings",
              url: "/settings/invoice",
            },
            {
              title: "Role Permission",
              url: "/settings/role-permission",
            },
            {
              title: "SMS Template",
              url: "/settings/sms-template",
            },
            {
              title: "Custom Field List",
              url: "/settings/custom-fields",
            },
            {
              title: "Discount Plan",
              url: "/settings/discount-plan",
            },
            {
              title: "Discount",
              url: "/settings/discount",
            },
            {
              title: "All Notification",
              url: "/settings/notifications",
            },
            {
              title: "Send Notification",
              url: "/settings/send-notification",
            },
            {
              title: "Warehouse",
              url: "/settings/warehouse",
            },
            {
              title: "Tables",
              url: "/settings/tables",
            },
            {
              title: "Customer Group",
              url: "/settings/customer-group",
            },
            {
              title: "Brand",
              url: "/settings/brand",
            },
            {
              title: "Unit",
              url: "/settings/unit",
            },
            {
              title: "Currency",
              url: "/settings/currency",
            },
            {
              title: "Tax",
              url: "/settings/tax",
            },
            {
              title: "User Profile",
              url: "/profile",
              // icon: UserCog,
            },
            {
              title: "Create SMS",
              url: "/settings/create-sms",
            },
            {
              title: "Backup Database",
              url: "/settings/backup",
            },
            {
              title: "General Setting",
              url: "/settings/general",
            },
            {
              title: "Mail Setting",
              url: "/settings/mail",
            },
            {
              title: "Reward Point Setting",
              url: "/settings/reward-point",
            },
            {
              title: "SMS Setting",
              url: "/settings/sms",
            },
            {
              title: "Payment Gateways",
              url: "/settings/payment-gateways",
            },
            {
              title: "POS Settings",
              url: "/settings/pos",
            },
            {
              title: "HRM Setting",
              url: "/settings/hrm",
            },
            {
              title: "Barcode Settings",
              url: "/settings/barcode",
            },
            {
              title: "Languages",
              url: "/settings/languages",
            },
            // {
            //   title: "Profile",
            //   url: "/settings",
            //   icon: UserCog,
            // },
            // {
            //   title: "Account",
            //   url: "/settings/account",
            //   icon: Wrench,
            // },
            // {
            //   title: "Appearance",
            //   url: "/settings/appearance",
            //   icon: Palette,
            // },
            // {
            //   title: "Notifications",
            //   url: "/settings/notifications",
            //   icon: Bell,
            // },
            // {
            //   title: "Display",
            //   url: "/settings/display",
            //   icon: Monitor,
            // },
          ],
        },
        {
          title: "Help Center",
          url: "/help-center",
          icon: HelpCircle,
        },
      ],
    },
  ],
}
