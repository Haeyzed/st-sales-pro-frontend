"use client"

import { UsersDialogs } from "./components/users-dialogs"
import { UsersPrimaryButtons } from "./components/users-primary-buttons"
import { UsersProvider } from "./users-provider"
import { UsersTable } from "./users-table"
import { users } from "./data/users"

export function Users() {
  return (
    <UsersProvider>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User List</h2>
          <p className="text-muted-foreground">
            Manage your users and their roles here.
          </p>
        </div>
        <UsersPrimaryButtons />
      </div>
      <UsersTable data={users} />
      <UsersDialogs />
    </UsersProvider>
  )
}

