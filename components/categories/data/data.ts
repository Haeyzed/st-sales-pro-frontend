import { FolderTree, Package, Star, StarOff } from "lucide-react"

export const categoryStatuses = [
  {
    label: "Active",
    value: "active",
    icon: Package,
  },
  {
    label: "Inactive",
    value: "inactive",
    icon: FolderTree,
  },
] as const

export const categoryFeaturedOptions = [
  {
    label: "Featured",
    value: "featured",
    icon: Star,
  },
  {
    label: "Not Featured",
    value: "not_featured",
    icon: StarOff,
  },
] as const



