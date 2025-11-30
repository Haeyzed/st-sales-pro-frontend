import {
  Package,
  PackageCheck,
  PackageX,
  Box,
  Boxes,
  Smartphone,
  ShoppingCart,
  FileText,
  Wrench,
} from "lucide-react"

export const productStatuses = [
  {
    label: "Active",
    value: "active",
    icon: PackageCheck,
  },
  {
    label: "Inactive",
    value: "inactive",
    icon: PackageX,
  },
] as const

export const productTypes = [
  {
    label: "All Types",
    value: "all",
    icon: Boxes,
  },
  {
    label: "Standard",
    value: "standard",
    icon: Package,
  },
  {
    label: "Combo",
    value: "combo",
    icon: Box,
  },
  {
    label: "Digital",
    value: "digital",
    icon: Smartphone,
  },
  {
    label: "Service",
    value: "service",
    icon: Wrench,
  },
] as const

export const stockFilters = [
  {
    label: "All Stock",
    value: "all",
    icon: Boxes,
  },
  {
    label: "In Stock",
    value: "in_stock",
    icon: PackageCheck,
  },
  {
    label: "Out of Stock",
    value: "out_of_stock",
    icon: PackageX,
  },
  {
    label: "Low Stock",
    value: "low_stock",
    icon: Package,
  },
] as const

