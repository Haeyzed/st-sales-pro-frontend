"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface TagInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value?: string[]
  onChange?: (tags: string[]) => void
  separator?: string
  maxTags?: number
  allowDuplicates?: boolean
  validateTag?: (tag: string) => boolean
  onTagAdd?: (tag: string) => void
  onTagRemove?: (tag: string) => void
}

export const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      value = [],
      onChange,
      separator = ",",
      maxTags,
      allowDuplicates = false,
      validateTag,
      onTagAdd,
      onTagRemove,
      className,
      placeholder = "Type and press Enter or comma...",
      disabled,
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = React.useState("")
    const [tags, setTags] = React.useState<string[]>(value)
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useImperativeHandle(ref, () => inputRef.current!)

    // Sync external value changes
    React.useEffect(() => {
      setTags(value)
    }, [value])

    const addTag = React.useCallback(
      (tag: string) => {
        const trimmedTag = tag.trim()
        
        if (!trimmedTag) return

        // Check max tags
        if (maxTags && tags.length >= maxTags) {
          return
        }

        // Check duplicates
        if (!allowDuplicates && tags.includes(trimmedTag)) {
          return
        }

        // Custom validation
        if (validateTag && !validateTag(trimmedTag)) {
          return
        }

        const newTags = [...tags, trimmedTag]
        setTags(newTags)
        onChange?.(newTags)
        onTagAdd?.(trimmedTag)
        setInputValue("")
      },
      [tags, maxTags, allowDuplicates, validateTag, onChange, onTagAdd]
    )

    const removeTag = React.useCallback(
      (tagToRemove: string) => {
        const newTags = tags.filter((tag) => tag !== tagToRemove)
        setTags(newTags)
        onChange?.(newTags)
        onTagRemove?.(tagToRemove)
      },
      [tags, onChange, onTagRemove]
    )

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      
      // Check if separator is typed
      if (value.includes(separator)) {
        const parts = value.split(separator)
        parts.forEach((part, index) => {
          // Add all parts except the last one (which might be incomplete)
          if (index < parts.length - 1 && part.trim()) {
            addTag(part)
          }
        })
        // Keep the last part in input (might be incomplete)
        const lastPart = parts[parts.length - 1]
        setInputValue(lastPart)
      } else {
        setInputValue(value)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === separator) {
        e.preventDefault()
        if (inputValue.trim()) {
          addTag(inputValue)
        }
      } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
        // Remove last tag when backspace is pressed on empty input
        e.preventDefault()
        removeTag(tags[tags.length - 1])
      }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pastedText = e.clipboardData.getData("text")
      const parts = pastedText.split(separator).map((part) => part.trim()).filter(Boolean)
      
      parts.forEach((part) => {
        addTag(part)
      })
    }

    return (
      <div
        className={cn(
          "flex min-h-9 w-full flex-wrap gap-1 rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        onClick={() => {
          if (!disabled) {
            inputRef.current?.focus()
          }
        }}
      >
        {tags.map((tag, index) => (
          <Badge
            key={`${tag}-${index}`}
            variant="secondary"
            className="h-6 gap-1 px-2 text-xs font-normal"
          >
            <span>{tag}</span>
            {!disabled && (
              <button
                type="button"
                className="ml-0.5 rounded-sm hover:bg-accent hover:text-accent-foreground focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation()
                  removeTag(tag)
                }}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {tag}</span>
              </button>
            )}
          </Badge>
        ))}
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          disabled={disabled}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="h-6 min-w-[120px] flex-1 border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed"
          {...props}
        />
      </div>
    )
  }
)

TagInput.displayName = "TagInput"

