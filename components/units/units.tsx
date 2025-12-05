"use client"

import { UnitsDialogs } from "./components/units-dialogs"
import { UnitsPrimaryButtons } from "./components/units-primary-buttons"
import { UnitsProvider } from "./units-provider"
import { UnitsTable } from "./units-table"

export default function Units() {
  return (
    <UnitsProvider>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Units</h2>
          <p className="text-muted-foreground">Manage your measurement units here.</p>
        </div>
        <UnitsPrimaryButtons />
      </div>
      <UnitsTable />
      <UnitsDialogs />
    </UnitsProvider>
  )
}
