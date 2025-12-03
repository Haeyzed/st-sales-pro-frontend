"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Check, ChevronsUpDown, X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
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
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { apiGetClient } from "@/lib/api-client-client"
import { toast } from "sonner"

type User = {
  id: number
  name: string
  email: string
}

interface EmailTagComboboxProps {
  value?: string[]
  onChange?: (emails: string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function EmailTagCombobox({
  value = [],
  onChange,
  placeholder = "Add email addresses...",
  disabled = false,
  className,
}: EmailTagComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  // Fetch users for dropdown
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["users-dropdown"],
    queryFn: async () => {
      try {
        const response = await apiGetClient<User[]>("users/dropdown")
        return response.data
      } catch (error: any) {
        toast.error(error?.message || "Failed to load users")
        return []
      }
    },
  })

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Add email (from user or custom)
  const addEmail = (email: string) => {
    const trimmedEmail = email.trim().toLowerCase()
    
    if (!trimmedEmail) return
    
    if (!isValidEmail(trimmedEmail)) {
      toast.error("Please enter a valid email address")
      return
    }

    if (value.includes(trimmedEmail)) {
      toast.error("Email already added")
      return
    }

    onChange?.([...value, trimmedEmail])
    setSearchTerm("")
  }

  // Add email from user selection
  const handleSelectUser = (user: User) => {
    addEmail(user.email)
  }

  // Add custom email
  const handleAddCustomEmail = () => {
    addEmail(searchTerm)
  }

  // Remove email
  const removeEmail = (emailToRemove: string) => {
    onChange?.(value.filter((email) => email !== emailToRemove))
  }

  // Check if search term matches any user
  const matchingUsers = React.useMemo(() => {
    if (!users || !searchTerm) return []
    const term = searchTerm.toLowerCase()
    return users.filter(
      (user) =>
        user.email.toLowerCase().includes(term) ||
        user.name.toLowerCase().includes(term)
    )
  }, [users, searchTerm])

  const showAddCustomOption =
    searchTerm && isValidEmail(searchTerm) && !matchingUsers.some((u) => u.email.toLowerCase() === searchTerm.toLowerCase())

  return (
    <div className={cn("space-y-2", className)}>
      <Popover modal={true} open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !searchTerm && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            {searchTerm || placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-w-none p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Type email or name..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Spinner />
                  <span className="ml-2 text-sm text-muted-foreground">Loading users...</span>
                </div>
              ) : matchingUsers.length > 0 ? (
                <CommandGroup heading="Users">
                  {matchingUsers.map((user) => {
                    const isSelected = value.includes(user.email.toLowerCase())
                    return (
                      <CommandItem
                        key={user.id}
                        value={`${user.name}-${user.email}`}
                        onSelect={() => handleSelectUser(user)}
                        disabled={isSelected}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              ) : showAddCustomOption ? (
                <CommandGroup>
                  <CommandItem onSelect={handleAddCustomEmail}>
                    <Plus className="mr-2 h-4 w-4 text-green-600" />
                    <span>
                      Add <strong className="font-medium">{searchTerm}</strong> as custom email
                    </span>
                  </CommandItem>
                </CommandGroup>
              ) : (
                <CommandEmpty>
                  {searchTerm
                    ? "No users found. Type a valid email to add custom address."
                    : "Type to search users or add custom email..."}
                </CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Emails Display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((email) => (
            <Badge key={email} variant="secondary" className="gap-1">
              {email}
              {!disabled && (
                <button
                  type="button"
                  className="ml-1 rounded-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => removeEmail(email)}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

