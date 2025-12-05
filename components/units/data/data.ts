import { CheckCircle2, XCircle } from "lucide-react"

export const unitStatuses = [
  {
    label: "Active",
    value: "active",
    icon: CheckCircle2,
  },
  {
    label: "Inactive",
    value: "inactive",
    icon: XCircle,
  },
] as const

export const unitOperators = [
  {
    label: "Multiply (*)",
    value: "*",
  },
  {
    label: "Divide (/)",
    value: "/",
  },
] as const
