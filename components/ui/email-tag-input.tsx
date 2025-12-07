"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon, XIcon, Mail } from "lucide-react"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export interface EmailUser {
  id: number
  name: string
  email: string
  avatar?: string
}

interface EmailTagInputProps {
  users: EmailUser[]
  selectedEmails: string[]
  onEmailsChange: (emails: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  loading?: boolean
  disabled?: boolean
  className?: string
}

export function EmailTagInput({
  users,
  selectedEmails,
  onEmailsChange,
  placeholder = "Select or add emails",
  searchPlaceholder = "Search or type email...",
  loading = false,
  disabled = false,
  className,
}: EmailTagInputProps) {
  const [open, setOpen] = React.useState(false)
  const [expanded, setExpanded] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const toggleSelection = (email: string) => {
    if (selectedEmails.includes(email)) {
      onEmailsChange(selectedEmails.filter((e) => e !== email))
    } else {
      onEmailsChange([...selectedEmails, email])
    }
  }

  const removeSelection = (email: string) => {
    onEmailsChange(selectedEmails.filter((e) => e !== email))
  }

  // Validate email format
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Add custom email if valid and Enter is pressed
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue && isValidEmail(inputValue)) {
      e.preventDefault()
      if (!selectedEmails.includes(inputValue)) {
        onEmailsChange([...selectedEmails, inputValue])
      }
      setInputValue("")
    }
  }

  // Find user by email
  const getUserByEmail = (email: string) => {
    return users.find((u) => u.email === email)
  }

  // Get initials from name or email
  const getInitials = (text: string) => {
    return text
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const maxShownItems = 2
  const visibleEmails = expanded ? selectedEmails : selectedEmails.slice(0, maxShownItems)
  const hiddenCount = selectedEmails.length - visibleEmails.length

  return (
    <Popover modal={true} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || loading}
          className={cn(
            "h-auto min-h-10 w-full justify-between hover:bg-transparent",
            className
          )}
        >
          <div className="flex flex-wrap items-center gap-1 pr-2.5">
            {selectedEmails.length > 0 ? (
              <>
                {visibleEmails.map((email) => {
                  const user = getUserByEmail(email)
                  return (
                    <Badge
                      key={email}
                      variant="outline"
                      className="rounded-sm gap-1"
                    >
                      {user ? (
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-[10px]">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <Mail className="h-3 w-3" />
                      )}
                      <span className="max-w-[150px] truncate">
                        {user ? user.name : email}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeSelection(email)
                        }}
                        asChild
                      >
                        <span>
                          <XIcon className="h-3 w-3" />
                        </span>
                      </Button>
                    </Badge>
                  )
                })}
                {hiddenCount > 0 || expanded ? (
                  <Badge
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpanded((prev) => !prev)
                    }}
                    className="rounded-sm cursor-pointer"
                  >
                    {expanded ? "Show Less" : `+${hiddenCount} more`}
                  </Badge>
                ) : null}
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDownIcon className="text-muted-foreground/80 h-4 w-4 shrink-0" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={handleKeyDown}
          />
          <CommandList>
            {inputValue && isValidEmail(inputValue) && !users.find((u) => u.email === inputValue) ? (
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    if (!selectedEmails.includes(inputValue)) {
                      onEmailsChange([...selectedEmails, inputValue])
                    }
                    setInputValue("")
                  }}
                  className="cursor-pointer"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  <span className="flex flex-col">
                    <span className="font-medium">Add &quot;{inputValue}&quot;</span>
                    <span className="text-muted-foreground text-xs">
                      Add this email address
                    </span>
                  </span>
                </CommandItem>
              </CommandGroup>
            ) : null}
            <CommandEmpty>
              {inputValue && !isValidEmail(inputValue)
                ? "Please enter a valid email address"
                : "No users found"}
            </CommandEmpty>
            <CommandGroup>
              {users
                .filter((user) =>
                  inputValue
                    ? user.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                      user.email.toLowerCase().includes(inputValue.toLowerCase())
                    : true
                )
                .map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.email}
                    onSelect={() => toggleSelection(user.email)}
                    className="cursor-pointer"
                  >
                    <span className="flex items-center gap-2 flex-1">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium truncate">{user.name}</span>
                        <span className="text-muted-foreground text-sm truncate">
                          {user.email}
                        </span>
                      </span>
                    </span>
                    {selectedEmails.includes(user.email) && (
                      <CheckIcon className="h-4 w-4 ml-2 shrink-0" />
                    )}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

