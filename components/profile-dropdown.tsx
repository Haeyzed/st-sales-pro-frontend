"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import useDialogState from "@/hooks/use-dialog-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SignOutDialog } from "@/components/sign-out-dialog"
import { useSession } from "next-auth/react"
import {
  User,
  Settings,
  Receipt,
  Calendar,
  Database,
  LogOut,
} from "lucide-react"

export function ProfileDropdown() {
  const [open, setOpen] = useDialogState()
  const { data: session } = useSession()

  const user = session?.user || {
    name: "User",
    email: "user@example.com",
    image: "/avatars/01.png",
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/sign-in" })
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image || "/avatars/01.png"} alt="@user" />
              <AvatarFallback>
                {user.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1.5">
              <p className="text-sm leading-none font-medium">
                {user.name || "User"}
              </p>
              <p className="text-muted-foreground text-xs leading-none">
                {user.email || "user@example.com"}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center gap-2">
              <User className="size-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings/general" className="flex items-center gap-2">
              <Settings className="size-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/my-transactions" className="flex items-center gap-2">
              <Receipt className="size-4" />
              <span>My Transactions</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/holidays/my-holiday"
              className="flex items-center gap-2"
            >
              <Calendar className="size-4" />
              <span>My Holiday</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/settings/empty-database"
              className="flex items-center gap-2"
            >
              <Database className="size-4" />
              <span>Empty Database</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />            
          <DropdownMenuItem asChild>
              <Link href="/lock-screen"
              className="flex items-center gap-2">
                Lock Screen
                <DropdownMenuShortcut>⇧⌘L</DropdownMenuShortcut>
              </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="size-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
