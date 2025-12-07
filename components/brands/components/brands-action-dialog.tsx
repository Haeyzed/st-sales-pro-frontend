"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadList,
  FileUploadItem,
  FileUploadItemPreview,
  FileUploadItemMetadata,
  FileUploadItemDelete,
  FileUploadTrigger,
} from "@/components/ui/file-upload"
import { CloudUpload, X } from "lucide-react"
import { type Brand } from "../data/schema"
import { createBrand, updateBrand } from "../data/brands"
import { useState } from "react"
import { Spinner } from "@/components/ui/spinner"

const formSchema = z.object({
  title: z.string().min(1, "Title is required."),
  image: z.array(z.instanceof(File)).optional(),
  is_active: z.boolean().optional(),
})

type BrandForm = z.infer<typeof formSchema>

type BrandActionDialogProps = {
  currentRow?: Brand
  open: boolean
  onOpenChange: (open: boolean) => void
}

function BrandActionForm({
  form,
  onSubmit,
  isDesktop,
  existingImage,
}: {
  form: ReturnType<typeof useForm<BrandForm>>
  onSubmit: (values: BrandForm) => void
  isDesktop: boolean
  existingImage?: string | null
}) {
  return (
    <Form {...form}>
      <form
        id="brand-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className={isDesktop ? "space-y-4 px-0.5" : "space-y-4"}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Title
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Brand title"
                  className={isDesktop ? "col-span-4" : undefined}
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end pt-3" : undefined}>
                Image
              </FormLabel>
              <FormControl>
                <div className={isDesktop ? "col-span-4" : undefined}>
                  <FileUpload
                    value={field.value || []}
                    onValueChange={field.onChange}
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    maxFiles={1}
                    maxSize={10 * 1024 * 1024} // 10MB
                  >
                    <FileUploadDropzone>
                      <CloudUpload className="h-4 w-4" />
                      <span className="text-sm">Drop image here or</span>
                      <FileUploadTrigger asChild>
                        <Button variant="link" size="sm" className="p-0 h-auto">
                          choose file
                        </Button>
                      </FileUploadTrigger>
                    </FileUploadDropzone>
                    <FileUploadList>
                      {field.value?.map((file, index) => (
                        <FileUploadItem key={index} value={file}>
                        <FileUploadItemPreview />
                        <FileUploadItemMetadata />
                        <FileUploadItemDelete asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </FileUploadItemDelete>
                        </FileUploadItem>
                      ))}
                    </FileUploadList>
                    {existingImage && (
                      <div className="mt-2 space-y-2">
                        <p className="text-sm font-medium">Current Image</p>
                        <div className="relative flex items-center gap-2 rounded-md border p-2 bg-background">
                          <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded border bg-accent/50">
                            <img
                              src={existingImage || "/placeholder.svg"}
                              alt="Current"
                              className="size-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-muted-foreground truncate">{existingImage.split("/").pop()}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </FileUpload>
                </div>
              </FormControl>
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
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

export function BrandsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: BrandActionDialogProps) {
  const isEdit = !!currentRow
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingImage, setExistingImage] = useState<string | null>(currentRow?.image_url || null)
  const form = useForm<BrandForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          title: currentRow.title,
          image: [],
          is_active: currentRow.is_active,
        }
      : {
          title: "",
          image: [],
          is_active: true,
        },
  })

  const onSubmit = async (values: BrandForm) => {
    setIsSubmitting(true)
    try {
      let response
      if (isEdit && currentRow) {
        response = await updateBrand(currentRow.id, values)
      } else {
        response = await createBrand(values)
      }

      // Use success message from API response
      toast.success(response.message || (isEdit ? "Brand updated successfully" : "Brand created successfully"))

      queryClient.invalidateQueries({ queryKey: ["brands"] })
      form.reset()
      onOpenChange(false)
    } catch (error: any) {
      // Check if error has validation errors structure
      if (error?.errors && typeof error.errors === "object") {
        // Set form errors for each field
        Object.entries(error.errors).forEach(([field, messages]) => {
          const fieldName = field as keyof BrandForm
          const errorMessages = Array.isArray(messages) ? messages : [messages]
          form.setError(fieldName, {
            type: "server",
            message: errorMessages[0] as string,
          })
        })
      }

      // Show error toast with API message
      const errorMessage =
        error?.message || (error instanceof Error ? error.message : "An error occurred")
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (state: boolean) => {
    form.reset()
    setExistingImage(currentRow?.image_url || null)
    onOpenChange(state)
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="text-start">
            <DialogTitle>
              {isEdit ? "Edit Brand" : "Add New Brand"}
            </DialogTitle>
            <DialogDescription>
              {isEdit ? "Update the brand here. " : "Create new brand here. "}
              Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
            <BrandActionForm
              form={form}
              onSubmit={onSubmit}
              isDesktop={isDesktop}
              existingImage={existingImage}
            />
          </div>
          <DialogFooter>
            <Button type="submit" form="brand-form" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2" />
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEdit ? "Update Brand" : "Add Brand"
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
          <DrawerTitle>
            {isEdit ? "Edit Brand" : "Add New Brand"}
          </DrawerTitle>
          <DrawerDescription>
            {isEdit ? "Update the brand here. " : "Create new brand here. "}
            Click save when you&apos;re done.
          </DrawerDescription>
        </DrawerHeader>
        <div className="max-h-[60vh] overflow-y-auto px-4">
          <BrandActionForm
            form={form}
            onSubmit={onSubmit}
            isDesktop={isDesktop}
            existingImage={existingImage}
          />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button type="submit" form="brand-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" />
                {isEdit ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEdit ? "Update Brand" : "Add Brand"
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

