"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { UnitCombobox } from "./unit-combobox"
import type { Unit } from "../data/schema"
import { createUnit, updateUnit } from "../data/units"
import { useState } from "react"
import { Spinner } from "@/components/ui/spinner"

const formSchema = z.object({
  unit_code: z.string().min(1, "Unit code is required."),
  unit_name: z.string().min(1, "Unit name is required."),
  base_unit: z.number().nullable().optional(),
  operator: z.enum(["*", "/"]).nullable().optional(),
  operation_value: z.number().nullable().optional(),
  is_active: z.boolean().optional(),
})

type UnitForm = z.infer<typeof formSchema>

type UnitActionDialogProps = {
  currentRow?: Unit
  open: boolean
  onOpenChange: (open: boolean) => void
}

function UnitActionForm({
  form,
  onSubmit,
  isDesktop,
  isEdit,
  currentUnitId,
}: {
  form: ReturnType<typeof useForm<UnitForm>>
  onSubmit: (values: UnitForm) => void
  isDesktop: boolean
  isEdit: boolean
  currentUnitId?: number
}) {
  const baseUnit = form.watch("base_unit")

  return (
    <Form {...form}>
      <form
        id="unit-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className={isDesktop ? "space-y-4 px-0.5" : "space-y-4"}
      >
        <FormField
          control={form.control}
          name="unit_code"
          render={({ field }) => (
            <FormItem className={isDesktop ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1" : undefined}>
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>Unit Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., KG, L, M"
                  className={isDesktop ? "col-span-4" : undefined}
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage className={isDesktop ? "col-span-4 col-start-3" : undefined} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unit_name"
          render={({ field }) => (
            <FormItem className={isDesktop ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1" : undefined}>
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>Unit Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Kilogram, Liter, Meter"
                  className={isDesktop ? "col-span-4" : undefined}
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage className={isDesktop ? "col-span-4 col-start-3" : undefined} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="base_unit"
          render={({ field }) => (
            <FormItem className={isDesktop ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1" : undefined}>
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>Base Unit</FormLabel>
              <FormControl>
                <UnitCombobox
                  value={field.value ?? null}
                  onValueChange={field.onChange}
                  placeholder="Select base unit (optional)"
                  className={isDesktop ? "col-span-4" : undefined}
                  excludeId={currentUnitId}
                />
              </FormControl>
              <FormMessage className={isDesktop ? "col-span-4 col-start-3" : undefined} />
            </FormItem>
          )}
        />
        {baseUnit && (
          <FormField
            control={form.control}
            name="operator"
            render={({ field }) => (
              <FormItem className={isDesktop ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1" : undefined}>
                <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>Operator</FormLabel>
                <FormControl>
                  <Select value={field.value || ""} onValueChange={(val) => field.onChange(val || null)}>
                    <SelectTrigger className={isDesktop ? "col-span-4" : undefined}>
                      <SelectValue placeholder="Select operator (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="*">Multiply (*)</SelectItem>
                      <SelectItem value="/">Divide (/)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className={isDesktop ? "col-span-4 col-start-3" : undefined} />
              </FormItem>
            )}
          />
        )}
        {baseUnit && (
          <FormField
            control={form.control}
            name="operation_value"
            render={({ field }) => (
              <FormItem className={isDesktop ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1" : undefined}>
                <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>Operation Value</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 1000, 0.001"
                    className={isDesktop ? "col-span-4" : undefined}
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || null
                      field.onChange(value)
                    }}
                  />
                </FormControl>
                <FormMessage className={isDesktop ? "col-span-4 col-start-3" : undefined} />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className={isDesktop ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1" : undefined}>
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>Active</FormLabel>
              <FormControl>
                <div className={isDesktop ? "col-span-4" : undefined}>
                  <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                </div>
              </FormControl>
              <FormMessage className={isDesktop ? "col-span-4 col-start-3" : undefined} />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

export function UnitsActionDialog({ currentRow, open, onOpenChange }: UnitActionDialogProps) {
  const isEdit = !!currentRow
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<UnitForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          unit_code: currentRow.unit_code,
          unit_name: currentRow.unit_name,
          base_unit: currentRow.base_unit,
          operator: currentRow.operator,
          operation_value: currentRow.operation_value,
          is_active: currentRow.is_active,
        }
      : {
          unit_code: "",
          unit_name: "",
          base_unit: null,
          operator: null,
          operation_value: null,
          is_active: true,
        },
  })

  const onSubmit = async (values: UnitForm) => {
    setIsSubmitting(true)
    try {
      let response
      if (isEdit && currentRow) {
        response = await updateUnit(currentRow.id, values)
      } else {
        response = await createUnit(values)
      }

      // Use success message from API response
      toast.success(response.message || (isEdit ? "Unit updated successfully" : "Unit created successfully"))

      queryClient.invalidateQueries({ queryKey: ["units"] })
      form.reset()
      onOpenChange(false)
    } catch (error: any) {
      // Check if error has validation errors structure
      if (error?.errors && typeof error.errors === "object") {
        // Set form errors for each field
        Object.entries(error.errors).forEach(([field, messages]) => {
          const fieldName = field as keyof UnitForm
          const errorMessages = Array.isArray(messages) ? messages : [messages]
          form.setError(fieldName, {
            type: "server",
            message: errorMessages[0] as string,
          })
        })
      }

      // Show error toast with API message
      const errorMessage = error?.message || (error instanceof Error ? error.message : "An error occurred")
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (state: boolean) => {
    form.reset()
    onOpenChange(state)
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="text-start">
            <DialogTitle>{isEdit ? "Edit Unit" : "Add New Unit"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "Update the unit here. " : "Create new unit here. "}
              Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
            <UnitActionForm
              form={form}
              onSubmit={onSubmit}
              isDesktop={isDesktop}
              isEdit={isEdit}
              currentUnitId={currentRow?.id}
            />
          </div>
          <DialogFooter>
            <Button type="submit" form="unit-form" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner />
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEdit ? "Update Unit" : "Add Unit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{isEdit ? "Edit Unit" : "Add New Unit"}</DrawerTitle>
          <DrawerDescription>
            {isEdit ? "Update the unit here. " : "Create new unit here. "}
            Click save when you&apos;re done.
          </DrawerDescription>
        </DrawerHeader>
        <div className="max-h-[60vh] overflow-y-auto px-4">
          <UnitActionForm form={form} onSubmit={onSubmit} isDesktop={isDesktop} isEdit={isEdit} />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button type="submit" form="unit-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner />
                {isEdit ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEdit ? "Update Unit" : "Add Unit"
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
