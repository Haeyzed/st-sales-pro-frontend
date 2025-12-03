"use client"

import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { EmailTagCombobox } from "@/components/ui/email-tag-combobox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { DateTimePicker } from "@/components/ui/date-time-picker"

export type ExportColumn = {
  id: string
  label: string
}

export type ExportFormData = {
  columns: string[]
  exportType: "excel" | "pdf"
  exportMethod: "download" | "email"
  emails: string[]
  scheduleEmail: boolean
  scheduleAt?: Date | null
}

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  columns: ExportColumn[]
  onExport: (data: ExportFormData) => Promise<void>
  isExporting?: boolean
}

export function ExportDialog({
  open,
  onOpenChange,
  title = "Export Data",
  description = "Select columns and export options",
  columns,
  onExport,
  isExporting = false,
}: ExportDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [selectedColumns, setSelectedColumns] = React.useState<string[]>(
    columns.map((col) => col.id)
  )
  const [exportType, setExportType] = React.useState<"excel" | "pdf">("excel")
  const [exportMethod, setExportMethod] = React.useState<"download" | "email">("download")
  const [emails, setEmails] = React.useState<string[]>([])
  const [scheduleEmail, setScheduleEmail] = React.useState(false)
  const [scheduleAt, setScheduleAt] = React.useState<Date | null>(null)

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedColumns(columns.map((col) => col.id))
      setExportType("excel")
      setExportMethod("download")
      setEmails([])
      setScheduleEmail(false)
      setScheduleAt(null)
    }
  }, [open, columns])

  const handleToggleColumn = (columnId: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    )
  }

  const handleSelectAll = () => {
    if (selectedColumns.length === columns.length) {
      setSelectedColumns([])
    } else {
      setSelectedColumns(columns.map((col) => col.id))
    }
  }

  const handleSubmit = async () => {
    if (selectedColumns.length === 0) {
      return
    }

    if (exportMethod === "email" && emails.length === 0) {
      return
    }

    if (scheduleEmail && !scheduleAt) {
      return
    }

    await onExport({
      columns: selectedColumns,
      exportType,
      exportMethod,
      emails,
      scheduleEmail,
      scheduleAt,
    })
  }

  const formContent = (
    <div className="space-y-6">
      {/* Column Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Select Columns</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
          >
            {selectedColumns.length === columns.length ? "Deselect All" : "Select All"}
          </Button>
        </div>
        <ScrollArea className="h-[200px] rounded-md border p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {columns.map((column) => (
              <div key={column.id} className="flex items-center space-x-2">
                <Checkbox
                  id={column.id}
                  checked={selectedColumns.includes(column.id)}
                  onCheckedChange={() => handleToggleColumn(column.id)}
                  disabled={isExporting}
                />
                <Label
                  htmlFor={column.id}
                  className="text-sm font-normal cursor-pointer"
                >
                  {column.label}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
        {selectedColumns.length === 0 && (
          <p className="text-sm text-destructive">Please select at least one column</p>
        )}
      </div>

      {/* Export Type */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Export Type</Label>
        <Select
          value={exportType}
          onValueChange={(value) => setExportType(value as "excel" | "pdf")}
          disabled={isExporting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select export type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="excel">Excel (.xlsx)</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Export Method */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Export Method</Label>
        <RadioGroup
          value={exportMethod}
          onValueChange={(value) => setExportMethod(value as "download" | "email")}
          disabled={isExporting}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="download" id="download" />
            <Label htmlFor="download" className="font-normal cursor-pointer">
              Download
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="email" id="email" />
            <Label htmlFor="email" className="font-normal cursor-pointer">
              Send to Email
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Email Selection (Conditional) */}
      {exportMethod === "email" && (
        <>
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Email Recipients <span className="text-red-500">*</span>
            </Label>
            <EmailTagCombobox
              value={emails}
              onChange={setEmails}
              placeholder="Select users or add custom emails..."
              disabled={isExporting}
            />
            {emails.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Select users from the list or type a custom email address
              </p>
            )}
          </div>

          {/* Schedule Email Option */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="schedule-email"
                checked={scheduleEmail}
                onCheckedChange={(checked) => setScheduleEmail(!!checked)}
                disabled={isExporting}
              />
              <Label htmlFor="schedule-email" className="font-normal cursor-pointer">
                Schedule email for later
              </Label>
            </div>

            {scheduleEmail && (
              <div className="space-y-2">
                <Label>
                  Schedule Date & Time <span className="text-red-500">*</span>
                </Label>
                <DateTimePicker
                  value={scheduleAt}
                  onChange={setScheduleAt}
                  placeholder="Select date and time..."
                  disabled={isExporting}
                />
                {!scheduleAt && (
                  <p className="text-sm text-muted-foreground">
                    Select when to send the email
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={isExporting}
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={
          isExporting ||
          selectedColumns.length === 0 ||
          (exportMethod === "email" && emails.length === 0) ||
          (exportMethod === "email" && scheduleEmail && !scheduleAt)
        }
      >
        {isExporting ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Exporting...
          </>
        ) : exportMethod === "download" ? (
          "Download"
        ) : (
          "Send Email"
        )}
      </Button>
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {formContent}
          <DialogFooter>{footer}</DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">{formContent}</div>
        <DrawerFooter className="pt-2">
          {footer}
          <DrawerClose asChild>
            <Button variant="outline" disabled={isExporting}>
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

