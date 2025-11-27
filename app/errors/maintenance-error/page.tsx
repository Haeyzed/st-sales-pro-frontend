"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function MaintenanceError() {
  const router = useRouter()

  return (
    <div className="h-svh">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] leading-tight font-bold">503</h1>
        <span className="font-medium">Service Unavailable</span>
        <p className="text-muted-foreground text-center">
          We&apos;re currently performing maintenance. <br />
          Please check back soon.
        </p>
        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
          <Button onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      </div>
    </div>
  )
}

