"use client"

import * as React from "react"
import { Check, ChevronsUpDown, PlusIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"

export interface ComboboxOption {
  value: string
  label: string
  image?: string // Optional image URL for each option
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange?: (value: string | undefined) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
  loading?: boolean
  onAddClick?: () => void
  addButtonText?: string
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
  className,
  loading = false,
  onAddClick,
  addButtonText = "Add new",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = options.find((option) => option.value === value)

  return (
    <Popover modal={true} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", !value && "text-muted-foreground", className)}
          disabled={disabled}
        >
          {selectedOption ? (
            <span className="flex min-w-0 items-center gap-2">
              {selectedOption.image && (
                <img
                  src={selectedOption.image || "/placeholder.svg"}
                  alt={selectedOption.label}
                  className="h-4 w-5 shrink-0 object-cover"
                />
              )}
              <span className="truncate">{selectedOption.label}</span>
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[var(--radix-popper-anchor-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    const newValue = option.value === value ? undefined : option.value
                    onValueChange?.(newValue)
                    setOpen(false)
                  }}
                >
                  {option.image && (
                    <img
                      src={option.image || "/placeholder.svg"}
                      alt={option.label}
                      className="mr-2 h-4 w-5 shrink-0 object-cover"
                    />
                  )}
                  {option.label}
                  {loading ? (
                    <Spinner className="ml-auto" />
                  ) : (
                    <Check className={cn("ml-auto h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            {onAddClick && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <Button
                    variant="ghost"
                    className="w-full justify-start font-normal"
                    onClick={() => {
                      onAddClick()
                      setOpen(false)
                    }}
                  >
                    <PlusIcon className="-ms-2 opacity-60" aria-hidden="true" />
                    {addButtonText}
                  </Button>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
