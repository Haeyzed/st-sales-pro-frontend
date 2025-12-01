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
    label: "All",
    value: "all",
    icon: Boxes,
  },
  {
    label: "With Stock",
    value: "with",
    icon: PackageCheck,
  },
  {
    label: "Without Stock",
    value: "without",
    icon: PackageX,
  },
] as const

