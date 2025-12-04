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
import { EmailTagInput, type EmailUser } from "@/components/ui/email-tag-input"
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
  users: EmailUser[]
  onExport: (data: ExportFormData) => Promise<void>
  isExporting?: boolean
  loadingUsers?: boolean
}

function ExportForm({
  columns,
  users,
  selectedColumns,
  exportType,
  exportMethod,
  emails,
  scheduleEmail,
  scheduleAt,
  isExporting,
  loadingUsers,
  isDesktop,
  onToggleColumn,
  onSelectAll,
  onExportTypeChange,
  onExportMethodChange,
  onEmailsChange,
  onScheduleEmailChange,
  onScheduleAtChange,
}: {
  columns: ExportColumn[]
  users: EmailUser[]
  selectedColumns: string[]
  exportType: "excel" | "pdf"
  exportMethod: "download" | "email"
  emails: string[]
  scheduleEmail: boolean
  scheduleAt: Date | null
  isExporting: boolean
  loadingUsers: boolean
  isDesktop: boolean
  onToggleColumn: (columnId: string) => void
  onSelectAll: () => void
  onExportTypeChange: (value: "excel" | "pdf") => void
  onExportMethodChange: (value: "download" | "email") => void
  onEmailsChange: (emails: string[]) => void
  onScheduleEmailChange: (checked: boolean) => void
  onScheduleAtChange: (date: Date | null) => void
}) {
  return (
    <div className={isDesktop ? "space-y-4 px-0.5" : "space-y-4"}>
      {/* Column Selection */}
      <div
        className={
          isDesktop
            ? "grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-3"
            : "space-y-2"
        }
      >
        <div
          className={
            isDesktop
              ? "col-span-2 flex items-center justify-end pt-2"
              : "flex items-center justify-between"
          }
        >
          <Label className={isDesktop ? "text-end" : undefined}>
            Select Columns
          </Label>
          {!isDesktop && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSelectAll}
              disabled={isExporting}
            >
              {selectedColumns.length === columns.length ? "Deselect All" : "Select All"}
            </Button>
          )}
        </div>
        <div className={isDesktop ? "col-span-4 space-y-2" : "space-y-2"}>
          {isDesktop && (
            <div className="flex justify-end mb-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onSelectAll}
                disabled={isExporting}
              >
                {selectedColumns.length === columns.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
          )}
          <ScrollArea className="h-[180px] rounded-md border p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {columns.map((column) => (
                <div key={column.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`column-${column.id}`}
                    checked={selectedColumns.includes(column.id)}
                    onCheckedChange={() => onToggleColumn(column.id)}
                    disabled={isExporting}
                  />
                  <Label
                    htmlFor={`column-${column.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {column.label}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
          {selectedColumns.length === 0 && (
            <p className={isDesktop ? "text-sm text-destructive" : "text-sm text-destructive"}>
              Please select at least one column
            </p>
          )}
        </div>
      </div>

      {/* Export Type */}
      <div
        className={
          isDesktop
            ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
            : "space-y-2"
        }
      >
        <Label className={isDesktop ? "col-span-2 text-end" : undefined}>
          Export Type
        </Label>
        <Select
          value={exportType}
          onValueChange={onExportTypeChange}
          disabled={isExporting}
        >
          <SelectTrigger className={isDesktop ? "col-span-4" : undefined}>
            <SelectValue placeholder="Select export type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="excel">Excel (.xlsx)</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Export Method */}
      <div
        className={
          isDesktop
            ? "grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1"
            : "space-y-2"
        }
      >
        <Label className={isDesktop ? "col-span-2 text-end pt-2" : undefined}>
          Export Method
        </Label>
        <RadioGroup
          value={exportMethod}
          onValueChange={onExportMethodChange}
          disabled={isExporting}
          className={isDesktop ? "col-span-4" : undefined}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="download" id="export-download" />
            <Label htmlFor="export-download" className="font-normal cursor-pointer">
              Download
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="email" id="export-email" />
            <Label htmlFor="export-email" className="font-normal cursor-pointer">
              Send to Email
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Email Selection (Conditional) */}
      {exportMethod === "email" && (
        <>
          <div
            className={
              isDesktop
                ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                : "space-y-2"
            }
          >
            <Label className={isDesktop ? "col-span-2 text-end" : undefined}>
              Email Recipients <span className="text-red-500">*</span>
            </Label>
            <div className={isDesktop ? "col-span-4 space-y-1" : "space-y-1"}>
              <EmailTagInput
                users={users}
                selectedEmails={emails}
                onEmailsChange={onEmailsChange}
                placeholder="Select users or add custom emails..."
                searchPlaceholder="Search user or type email..."
                disabled={isExporting}
                loading={loadingUsers}
              />
              {emails.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Select users from the list or type a custom email address and press Enter
                </p>
              )}
            </div>
          </div>

          {/* Schedule Email Option */}
          <div
            className={
              isDesktop
                ? "grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-3"
                : "space-y-3"
            }
          >
            <div className={isDesktop ? "col-span-2" : undefined} />
            <div className={isDesktop ? "col-span-4 space-y-3" : "space-y-3"}>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="schedule-email-checkbox"
                  checked={scheduleEmail}
                  onCheckedChange={onScheduleEmailChange}
                  disabled={isExporting}
                />
                <Label htmlFor="schedule-email-checkbox" className="font-normal cursor-pointer">
                  Schedule email for later
                </Label>
              </div>

              {scheduleEmail && (
                <div className="space-y-1.5">
                  <Label>
                    Schedule Date & Time <span className="text-red-500">*</span>
                  </Label>
                  <DateTimePicker
                    value={scheduleAt}
                    onChange={onScheduleAtChange}
                    placeholder="Select date and time..."
                    disabled={isExporting}
                  />
                  {!scheduleAt && (
                    <p className="text-xs text-muted-foreground">
                      Select when to send the email
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function ExportDialog({
  open,
  onOpenChange,
  title = "Export Data",
  description = "Select columns and export options",
  columns,
  users,
  onExport,
  isExporting = false,
  loadingUsers = false,
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

  const footer = (
    <>
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
    </>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-start">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <ExportForm
            columns={columns}
            users={users}
            selectedColumns={selectedColumns}
            exportType={exportType}
            exportMethod={exportMethod}
            emails={emails}
            scheduleEmail={scheduleEmail}
            scheduleAt={scheduleAt}
            isExporting={isExporting}
            loadingUsers={loadingUsers}
            isDesktop={isDesktop}
            onToggleColumn={handleToggleColumn}
            onSelectAll={handleSelectAll}
            onExportTypeChange={setExportType}
            onExportMethodChange={setExportMethod}
            onEmailsChange={setEmails}
            onScheduleEmailChange={setScheduleEmail}
            onScheduleAtChange={setScheduleAt}
          />
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
        <div className="max-h-[60vh] overflow-y-auto px-4">
          <ExportForm
            columns={columns}
            users={users}
            selectedColumns={selectedColumns}
            exportType={exportType}
            exportMethod={exportMethod}
            emails={emails}
            scheduleEmail={scheduleEmail}
            scheduleAt={scheduleAt}
            isExporting={isExporting}
            loadingUsers={loadingUsers}
            isDesktop={isDesktop}
            onToggleColumn={handleToggleColumn}
            onSelectAll={handleSelectAll}
            onExportTypeChange={setExportType}
            onExportMethodChange={setExportMethod}
            onEmailsChange={setEmails}
            onScheduleEmailChange={setScheduleEmail}
            onScheduleAtChange={setScheduleAt}
          />
        </div>
        <DrawerFooter className="pt-2">
          {footer}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
