import { FolderTree, Package } from "lucide-react"

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



