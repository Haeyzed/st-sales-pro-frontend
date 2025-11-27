"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { showSubmittedData } from "@/lib/show-submitted-data"
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
import { PasswordInput } from "@/components/password-input"
import { SelectDropdown } from "@/components/select-dropdown"
import { roles } from "../data/data"
import { type User } from "../data/schema"

const formSchema = z
  .object({
    firstName: z.string().min(1, "First Name is required."),
    lastName: z.string().min(1, "Last Name is required."),
    username: z.string().min(1, "Username is required."),
    phoneNumber: z.string().min(1, "Phone number is required."),
    email: z.email({
      message: "Email is required.",
    }),
    password: z.string().transform((pwd) => pwd.trim()),
    role: z.string().min(1, "Role is required."),
    confirmPassword: z.string().transform((pwd) => pwd.trim()),
    isEdit: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.isEdit && !data.password) return true
      return data.password.length > 0
    },
    {
      message: "Password is required.",
      path: ["password"],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true
      return password.length >= 8
    },
    {
      message: "Password must be at least 8 characters long.",
      path: ["password"],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true
      return /[a-z]/.test(password)
    },
    {
      message: "Password must contain at least one lowercase letter.",
      path: ["password"],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true
      return /\d/.test(password)
    },
    {
      message: "Password must contain at least one number.",
      path: ["password"],
    }
  )
  .refine(
    ({ isEdit, password, confirmPassword }) => {
      if (isEdit && !password) return true
      return password === confirmPassword
    },
    {
      message: "Passwords don't match.",
      path: ["confirmPassword"],
    }
  )

type UserForm = z.infer<typeof formSchema>

type UserActionDialogProps = {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

function UserActionForm({
  form,
  onSubmit,
  isPasswordTouched,
  isDesktop,
}: {
  form: ReturnType<typeof useForm<UserForm>>
  onSubmit: (values: UserForm) => void
  isPasswordTouched: boolean
  isDesktop: boolean
}) {
  return (
    <Form {...form}>
      <form
        id="user-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className={isDesktop ? "space-y-4 px-0.5" : "space-y-4"}
      >
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                First Name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="John"
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
          name="lastName"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Last Name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Doe"
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
          name="username"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Username
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="john_doe"
                  className={isDesktop ? "col-span-4" : undefined}
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
          name="email"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Email
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="john.doe@gmail.com"
                  className={isDesktop ? "col-span-4" : undefined}
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
          name="phoneNumber"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Phone Number
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="+123456789"
                  className={isDesktop ? "col-span-4" : undefined}
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
          name="role"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Role
              </FormLabel>
              <SelectDropdown
                defaultValue={field.value}
                onValueChange={field.onChange}
                placeholder="Select a role"
                className={isDesktop ? "col-span-4" : undefined}
                items={roles.map(({ label, value }) => ({
                  label,
                  value,
                }))}
              />
              <FormMessage
                className={isDesktop ? "col-span-4 col-start-3" : undefined}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Password
              </FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="e.g., S3cur3P@ssw0rd"
                  className={isDesktop ? "col-span-4" : undefined}
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
          name="confirmPassword"
          render={({ field }) => (
            <FormItem
              className={
                isDesktop
                  ? "grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1"
                  : undefined
              }
            >
              <FormLabel className={isDesktop ? "col-span-2 text-end" : undefined}>
                Confirm Password
              </FormLabel>
              <FormControl>
                <PasswordInput
                  disabled={!isPasswordTouched}
                  placeholder="e.g., S3cur3P@ssw0rd"
                  className={isDesktop ? "col-span-4" : undefined}
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

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: UserActionDialogProps) {
  const isEdit = !!currentRow
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          ...currentRow,
          password: "",
          confirmPassword: "",
          isEdit,
        }
      : {
          firstName: "",
          lastName: "",
          username: "",
          email: "",
          role: "",
          phoneNumber: "",
          password: "",
          confirmPassword: "",
          isEdit,
        },
  })

  const onSubmit = (values: UserForm) => {
    form.reset()
    showSubmittedData(values)
    onOpenChange(false)
  }

  const isPasswordTouched = !!form.formState.dirtyFields.password

  const handleOpenChange = (state: boolean) => {
    form.reset()
    onOpenChange(state)
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="text-start">
            <DialogTitle>{isEdit ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "Update the user here. " : "Create new user here. "}
              Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
            <UserActionForm
              form={form}
              onSubmit={onSubmit}
              isPasswordTouched={isPasswordTouched}
              isDesktop={isDesktop}
            />
          </div>
          <DialogFooter>
            <Button type="submit" form="user-form">
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
          <DrawerTitle>{isEdit ? "Edit User" : "Add New User"}</DrawerTitle>
          <DrawerDescription>
            {isEdit ? "Update the user here. " : "Create new user here. "}
            Click save when you&apos;re done.
          </DrawerDescription>
        </DrawerHeader>
        <div className="max-h-[60vh] overflow-y-auto px-4">
          <UserActionForm
            form={form}
            onSubmit={onSubmit}
            isPasswordTouched={isPasswordTouched}
            isDesktop={isDesktop}
          />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button type="submit" form="user-form">
            Save changes
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
