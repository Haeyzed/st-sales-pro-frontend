"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { showSubmittedData } from "@/lib/show-submitted-data"
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

const formSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, {
      message: "Please upload a file",
    })
    .refine(
      (files) => ["text/csv"].includes(files?.[0]?.type),
      "Please upload csv format."
    ),
})

type TaskImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function TaskImportForm({
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
      <form id="task-import-form" onSubmit={form.handleSubmit(onSubmit)}>
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

export function TasksImportDialog({
  open,
  onOpenChange,
}: TaskImportDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { file: undefined },
  })

  const fileRef = form.register("file")

  const onSubmit = () => {
    const file = form.getValues("file")

    if (file && file[0]) {
      const fileDetails = {
        name: file[0].name,
        size: file[0].size,
        type: file[0].type,
      }
      showSubmittedData(fileDetails, "You have imported the following file:")
    }
    onOpenChange(false)
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
            <DialogTitle>Import Tasks</DialogTitle>
            <DialogDescription>
              Import tasks quickly from a CSV file.
            </DialogDescription>
          </DialogHeader>
          <TaskImportForm form={form} fileRef={fileRef} onSubmit={onSubmit} />
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button type="submit" form="task-import-form">
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
          <DrawerTitle>Import Tasks</DrawerTitle>
          <DrawerDescription>
            Import tasks quickly from a CSV file.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <TaskImportForm form={form} fileRef={fileRef} onSubmit={onSubmit} />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
          <Button type="submit" form="task-import-form">
            Import
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

