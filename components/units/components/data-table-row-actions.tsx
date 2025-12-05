"use client"

import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { type Row } from "@tanstack/react-table"
import { Trash2, FolderPen } from "lucide-react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type Unit } from "../data/schema"
import { useUnits } from "../units-provider"
import { canPerformAction } from "@/lib/permissions"

type DataTableRowActionsProps = {
  row: Row<Unit>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useUnits()
  const { data: session } = useSession()

  const canUpdate = canPerformAction(session, "units:update")
  const canDelete = canPerformAction(session, "units:delete")

  // Don't show menu if user has no permissions
  if (!canUpdate && !canDelete) {
    return null
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {canUpdate && (
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen("edit")
            }}
          >
            Edit
            <DropdownMenuShortcut>
              <FolderPen size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        {canUpdate && canDelete && <DropdownMenuSeparator />}
        {canDelete && (
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen("delete")
            }}
            className="text-red-500"
          >
            Delete
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}



