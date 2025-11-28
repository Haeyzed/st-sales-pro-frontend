"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useQueryClient } from "@tanstack/react-query"
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
import { SelectDropdown } from "@/components/select-dropdown"
import { type Category } from "../data/schema"
import { createCategory, updateCategory, getCategoryDropdown } from "../data/categories"

const formSchema = z.object({
  name: z.string().min(1, "Name is required."),
  parent_id: z.number().nullable().optional(),
  slug: z.string().nullable().optional(),
  featured: z.boolean().nullable().optional(),
  page_title: z.string().nullable().optional(),
  short_description: z.string().nullable().optional(),
  is_sync_disable: z.boolean().nullable().optional(),
  image: z.instanceof(File).nullable().optional(),
  icon: z.instanceof(File).nullable().optional(),
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
}: {
  form: ReturnType<typeof useForm<CategoryForm>>
  onSubmit: (values: CategoryForm) => void
  isDesktop: boolean
  isEdit: boolean
}) {
  const { data: categories } = useQuery({
    queryKey: ["category-dropdown"],
    queryFn: getCategoryDropdown,
  })

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
              <SelectDropdown
                defaultValue={field.value?.toString()}
                onValueChange={(value) =>
                  field.onChange(value ? parseInt(value, 10) : null)
                }
                placeholder="Select parent category (optional)"
                className={isDesktop ? "col-span-4" : undefined}
                items={[
                  { label: "None", value: "" },
                  ...(categories || []).map((cat) => ({
                    label: cat.name,
                    value: cat.id.toString(),
                  })),
                ]}
              />
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
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Image
              </FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  className={isDesktop ? "col-span-4" : undefined}
                  onChange={(e) => onChange(e.target.files?.[0] || null)}
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
          name="icon"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Icon
              </FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  className={isDesktop ? "col-span-4" : undefined}
                  onChange={(e) => onChange(e.target.files?.[0] || null)}
                  {...field}
                />
              </FormControl>
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
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
          image: null,
          icon: null,
        }
      : {
          name: "",
          parent_id: null,
          slug: null,
          featured: false,
          page_title: null,
          short_description: null,
          is_sync_disable: false,
          image: null,
          icon: null,
        },
  })

  const onSubmit = async (values: CategoryForm) => {
    try {
      if (isEdit && currentRow) {
        await updateCategory(currentRow.id, values)
        toast.success("Category updated successfully")
      } else {
        await createCategory(values)
        toast.success("Category created successfully")
      }

      queryClient.invalidateQueries({ queryKey: ["categories"] })
      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An error occurred"
      )
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
            />
          </div>
          <DialogFooter>
            <Button type="submit" form="category-form">
              Save changes
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
          />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button type="submit" form="category-form">
            Save changes
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}



