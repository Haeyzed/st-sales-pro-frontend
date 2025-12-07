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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
import { CategoryCombobox } from "./category-combobox"
import { type Category } from "../data/schema"
import { createCategory, updateCategory } from "../data/categories"
import { useState } from "react"
import { Spinner } from "@/components/ui/spinner"

const formSchema = z.object({
  name: z.string().min(1, "Name is required."),
  parent_id: z.number().nullable().optional(),
  slug: z.string().nullable().optional(),
  featured: z.boolean().nullable().optional(),
  page_title: z.string().nullable().optional(),
  short_description: z.string().nullable().optional(),
  is_sync_disable: z.boolean().nullable().optional(),
  image: z.array(z.instanceof(File)).optional(),
  is_active: z.boolean().optional(),
})

type CategoryForm = z.infer<typeof formSchema>

type CategoryActionDialogProps = {
  currentRow?: Category
  open: boolean
  onOpenChange: (open: boolean) => void
}

function CategoryActionForm({
  form,
  onSubmit,
  isDesktop,
  isEdit,
  currentCategoryId,
  existingImage,
}: {
  form: ReturnType<typeof useForm<CategoryForm>>
  onSubmit: (values: CategoryForm) => void
  isDesktop: boolean
  isEdit: boolean
  currentCategoryId?: number
  existingImage?: string | null
}) {
  return (
    <Form {...form}>
      <form
        id="category-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className={isDesktop ? "space-y-4 px-0.5" : "space-y-4"}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Category name"
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
          name="parent_id"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Parent Category
              </FormLabel>
              <FormControl>
                <CategoryCombobox
                  value={field.value ?? null}
                  onValueChange={field.onChange}
                  placeholder="Select parent category (optional)"
                  className={isDesktop ? "col-span-4" : undefined}
                  excludeId={currentCategoryId}
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
          name="slug"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Slug
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="category-slug (optional)"
                  className={isDesktop ? "col-span-4" : undefined}
                  {...field}
                  value={field.value || ""}
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
          name="page_title"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Page Title
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="SEO page title (optional)"
                  className={isDesktop ? "col-span-4" : undefined}
                  {...field}
                  value={field.value || ""}
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
          name="short_description"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Description
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Short description (optional)"
                  className={isDesktop ? "col-span-4" : undefined}
                  {...field}
                  value={field.value || ""}
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
          name="featured"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Featured
              </FormLabel>
              <FormControl>
                <div className={isDesktop ? "col-span-4" : undefined}>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
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
          name="is_sync_disable"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Disable Sync
              </FormLabel>
              <FormControl>
                <div className={isDesktop ? "col-span-4" : undefined}>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
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

export function CategoriesActionDialog({
  currentRow,
  open,
  onOpenChange,
}: CategoryActionDialogProps) {
  const isEdit = !!currentRow
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingImage, setExistingImage] = useState<string | null>(currentRow?.image_url || null)
  const form = useForm<CategoryForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          parent_id: currentRow.parent_id,
          slug: currentRow.slug,
          featured: currentRow.featured ?? false,
          page_title: currentRow.page_title,
          short_description: currentRow.short_description,
          is_sync_disable: currentRow.is_sync_disable,
          image: [],
          is_active: currentRow.is_active,
        }
      : {
          name: "",
          parent_id: null,
          slug: null,
          featured: false,
          page_title: null,
          short_description: null,
          is_sync_disable: false,
          image: [],
          is_active: true,
        },
  })

  const onSubmit = async (values: CategoryForm) => {
    setIsSubmitting(true)
    try {
      let response
      if (isEdit && currentRow) {
        response = await updateCategory(currentRow.id, values)
      } else {
        response = await createCategory(values)
      }

      // Use success message from API response
      toast.success(response.message || (isEdit ? "Category updated successfully" : "Category created successfully"))

      queryClient.invalidateQueries({ queryKey: ["categories"] })
      form.reset()
      onOpenChange(false)
    } catch (error: any) {
      // Check if error has validation errors structure
      if (error?.errors && typeof error.errors === "object") {
        // Set form errors for each field
        Object.entries(error.errors).forEach(([field, messages]) => {
          const fieldName = field as keyof CategoryForm
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
              {isEdit ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {isEdit ? "Update the category here. " : "Create new category here. "}
              Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
            <CategoryActionForm
              form={form}
              onSubmit={onSubmit}
              isDesktop={isDesktop}
              isEdit={isEdit}
              currentCategoryId={currentRow?.id}
              existingImage={existingImage}
            />
          </div>
          <DialogFooter>
            <Button type="submit" form="category-form" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2" />
                    {isEdit ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEdit ? "Update Category" : "Add Category"
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
            {isEdit ? "Edit Category" : "Add New Category"}
          </DrawerTitle>
          <DrawerDescription>
            {isEdit ? "Update the category here. " : "Create new category here. "}
            Click save when you&apos;re done.
          </DrawerDescription>
        </DrawerHeader>
        <div className="max-h-[60vh] overflow-y-auto px-4">
          <CategoryActionForm
            form={form}
            onSubmit={onSubmit}
            isDesktop={isDesktop}
            isEdit={isEdit}
            existingImage={existingImage}
          />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button type="submit" form="category-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" />
                {isEdit ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEdit ? "Update Category" : "Add Category"
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}



