"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { toast } from "sonner"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { type ChatUser } from "../data/chat-types"

type User = Omit<ChatUser, "messages">

type NewChatProps = {
  users: User[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

function NewChatContent({
  users,
  selectedUsers,
  handleSelectUser,
  handleRemoveUser,
  handleChat,
}: {
  users: User[]
  selectedUsers: User[]
  handleSelectUser: (user: User) => void
  handleRemoveUser: (userId: string) => void
  handleChat: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline-last gap-2">
        <span className="text-muted-foreground min-h-6 text-sm">To:</span>
        {selectedUsers.map((user) => (
          <Badge key={user.id} variant="default">
            {user.fullName}
            <button
              className="ring-offset-background focus:ring-ring ms-1 rounded-full outline-hidden focus:ring-2 focus:ring-offset-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRemoveUser(user.id)
                }
              }}
              onClick={() => handleRemoveUser(user.id)}
              aria-label={`Remove ${user.fullName}`}
              title={`Remove ${user.fullName}`}
            >
              <X className="text-muted-foreground hover:text-foreground h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Command className="rounded-lg border">
        <CommandInput placeholder="Search people..." className="text-foreground" />
        <CommandList>
          <CommandEmpty>No people found.</CommandEmpty>
          <CommandGroup>
            {users.map((user) => (
              <CommandItem
                key={user.id}
                onSelect={() => handleSelectUser(user)}
                className="hover:bg-accent hover:text-accent-foreground flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={user.profile || "/placeholder.svg"}
                    alt={user.fullName}
                    className="h-8 w-8 rounded-full"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.fullName}</span>
                    <span className="text-accent-foreground/70 text-xs">
                      {user.username}
                    </span>
                  </div>
                </div>

                {selectedUsers.find((u) => u.id === user.id) && (
                  <Check className="h-4 w-4" />
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
      <Button
        variant="default"
        onClick={handleChat}
        disabled={selectedUsers.length === 0}
      >
        Chat
      </Button>
    </div>
  )
}

export function NewChat({ users, onOpenChange, open }: NewChatProps) {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])

  const handleSelectUser = (user: User) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user])
    } else {
      handleRemoveUser(user.id)
    }
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId))
  }

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)
    if (!newOpen) {
      setSelectedUsers([])
    }
  }

  const handleChat = () => {
    toast.success(`Starting chat with ${selectedUsers.map((u) => u.fullName).join(", ")}`)
    handleOpenChange(false)
  }

  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>New message</DialogTitle>
          </DialogHeader>
          <NewChatContent
            users={users}
            selectedUsers={selectedUsers}
            handleSelectUser={handleSelectUser}
            handleRemoveUser={handleRemoveUser}
            handleChat={handleChat}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>New message</DrawerTitle>
          <DrawerDescription>
            Select users to start a new conversation.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <NewChatContent
            users={users}
            selectedUsers={selectedUsers}
            handleSelectUser={handleSelectUser}
            handleRemoveUser={handleRemoveUser}
            handleChat={handleChat}
          />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button
            variant="default"
            onClick={handleChat}
            disabled={selectedUsers.length === 0}
          >
            Chat
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

