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
  DialogClose,
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { importCategories } from "../data/categories"

const formSchema = z.object({
  file: z
    .any()
    .refine((files) => files && files.length > 0, {
      message: "Please upload a file",
    })
    .refine(
      (files) => files?.[0]?.type && ["text/csv"].includes(files[0].type),
      "Please upload csv format."
    ),
})

type CategoryImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function CategoryImportForm({
  form,
  fileRef,
  onSubmit,
}: {
  form: ReturnType<typeof useForm<z.infer<typeof formSchema>>>
  fileRef: ReturnType<typeof form.register<"file">>
  onSubmit: () => void
}) {
  return (
    <Form {...form}>
      <form id="category-import-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="file"
          render={() => (
            <FormItem className="my-2">
              <FormLabel>File</FormLabel>
              <FormControl>
                <Input type="file" {...fileRef} className="h-8 py-0" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

export function CategoriesImportDialog({
  open,
  onOpenChange,
}: CategoryImportDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const queryClient = useQueryClient()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { file: undefined },
  })

  const fileRef = form.register("file")

  const onSubmit = async () => {
    const file = form.getValues("file")

    if (file && file[0]) {
      try {
        const result = await importCategories(file[0])
        toast.success(
          `Successfully imported ${result.imported} categories${
            result.errors.length > 0
              ? ` with ${result.errors.length} errors`
              : ""
          }`
        )
        queryClient.invalidateQueries({ queryKey: ["categories"] })
        onOpenChange(false)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to import categories"
        )
      }
    }
  }

  const handleOpenChange = (val: boolean) => {
    onOpenChange(val)
    form.reset()
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="gap-2 sm:max-w-sm">
          <DialogHeader className="text-start">
            <DialogTitle>Import Categories</DialogTitle>
            <DialogDescription>
              Import categories quickly from a CSV file.
            </DialogDescription>
          </DialogHeader>
          <CategoryImportForm form={form} fileRef={fileRef} onSubmit={onSubmit} />
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button type="submit" form="category-import-form">
              Import
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
          <DrawerTitle>Import Categories</DrawerTitle>
          <DrawerDescription>
            Import categories quickly from a CSV file.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <CategoryImportForm form={form} fileRef={fileRef} onSubmit={onSubmit} />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
          <Button type="submit" form="category-import-form">
            Import
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}



