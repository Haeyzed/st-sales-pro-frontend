"use client"

import Link from "next/link"
import {
  Package,
  ShoppingCart,
  DollarSign,
  FileText,
  Truck,
  Users,
  UserPlus,
  Building2,
  FolderPlus,
  Plus,
  Receipt,
  CreditCard,
  TrendingUp,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const shortcuts = [
  {
    category: "Product",
    items: [
      { label: "Add Category", href: "/products/category", icon: FolderPlus },
      { label: "Add Product", href: "/products/create", icon: Package },
      { label: "Product List", href: "/products", icon: Package },
    ],
  },
  {
    category: "Purchase",
    items: [
      { label: "Add Purchase", href: "/purchases/create", icon: ShoppingCart },
      { label: "Purchase List", href: "/purchases", icon: Receipt },
    ],
  },
  {
    category: "Sale",
    items: [
      { label: "POS", href: "/pos", icon: CreditCard },
      { label: "Add Sale", href: "/sales/create", icon: DollarSign },
      { label: "Sale List", href: "/sales", icon: Receipt },
    ],
  },
  {
    category: "Expense",
    items: [
      { label: "Add Expense", href: "/expenses/create", icon: TrendingUp },
      { label: "Expense List", href: "/expenses", icon: BarChart3 },
    ],
  },
  {
    category: "Quotation",
    items: [
      { label: "Add Quotation", href: "/quotations/create", icon: FileText },
      { label: "Quotation List", href: "/quotations", icon: FileText },
    ],
  },
  {
    category: "Transfer",
    items: [
      { label: "Add Transfer", href: "/transfers/create", icon: Truck },
      { label: "Transfer List", href: "/transfers", icon: Truck },
    ],
  },
  {
    category: "People",
    items: [
      { label: "Add User", href: "/people/users/create", icon: UserPlus },
      { label: "Add Customer", href: "/people/customers/create", icon: Users },
      { label: "Add Supplier", href: "/people/suppliers/create", icon: Building2 },
    ],
  },
]

export function ShortcutsPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Plus className="size-5" />
          <span className="sr-only">Open shortcuts</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        <div className="p-4">
          <h4 className="mb-4 text-sm font-semibold">Quick Actions</h4>
          <div className="max-h-[400px] space-y-4 overflow-y-auto pr-2">
            {shortcuts.map((group) => (
              <div key={group.category}>
                <h5 className="mb-2 text-xs font-medium text-muted-foreground">
                  {group.category}
                </h5>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                          "hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

