"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { BadgeCheckIcon, XCircleIcon, Loader2 } from "lucide-react"
import { Item, ItemContent, ItemMedia, ItemTitle, ItemActions } from "@/components/ui/item"
import { Button } from "@/components/ui/button"
import { AuthLayout } from "@/components/auth/auth-layout"
import Link from "next/link"
import { toast } from "sonner"

type VerificationStatus = "verifying" | "success" | "error" | "already-verified"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<VerificationStatus>("verifying")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    const verifyEmail = async () => {
      // Extract query parameters from the signed URL
      const expires = searchParams.get("expires")
      const hash = searchParams.get("hash")
      const signature = searchParams.get("signature")
      const id = searchParams.get("id")

      if (!expires || !hash || !signature || !id) {
        setStatus("error")
        setMessage("Invalid verification link. Please check your email for a valid link.")
        return
      }

      try {
        // Call the verification API with the signed URL parameters
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

        const params = new URLSearchParams({
          expires,
          hash,
          signature,
          id,
        })

        const response = await fetch(
          `${API_BASE_URL}/auth/verify-email?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            credentials: "include",
          }
        )

        const data = await response.json()

        if (response.ok) {
          if (data.message?.includes("already verified")) {
            setStatus("already-verified")
            setMessage("Your email has already been verified.")
          } else {
            setStatus("success")
            setMessage("Your email has been verified successfully!")
            toast.success("Email verified successfully!")
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              router.push("/dashboard")
            }, 2000)
          }
        } else {
          setStatus("error")
          setMessage(
            data.message || "Verification failed. The link may have expired."
          )
          toast.error(data.message || "Verification failed")
        }
      } catch (error) {
        setStatus("error")
        setMessage(
          "An error occurred during verification. Please try again or request a new verification link."
        )
        toast.error("Verification error")
        console.error("Verification error:", error)
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <AuthLayout>
      <div className="flex w-full max-w-md flex-col gap-6">
        {status === "verifying" && (
          <Item variant="outline">
            <ItemMedia>
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Verifying your email...</ItemTitle>
              <p className="text-muted-foreground text-sm">
                Please wait while we verify your email address.
              </p>
            </ItemContent>
          </Item>
        )}

        {status === "success" && (
          <Item variant="outline" size="sm">
            <ItemMedia>
              <BadgeCheckIcon className="size-5 text-green-600 dark:text-green-400" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Your email has been verified!</ItemTitle>
              <p className="text-muted-foreground text-sm">{message}</p>
            </ItemContent>
            <ItemActions>
              <Button asChild size="sm">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </ItemActions>
          </Item>
        )}

        {status === "already-verified" && (
          <Item variant="outline" size="sm">
            <ItemMedia>
              <BadgeCheckIcon className="size-5 text-blue-600 dark:text-blue-400" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Email already verified</ItemTitle>
              <p className="text-muted-foreground text-sm">{message}</p>
            </ItemContent>
            <ItemActions>
              <Button asChild size="sm" variant="outline">
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </ItemActions>
          </Item>
        )}

        {status === "error" && (
          <Item variant="outline" size="sm">
            <ItemMedia>
              <XCircleIcon className="size-5 text-destructive" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Verification failed</ItemTitle>
              <p className="text-muted-foreground text-sm">{message}</p>
            </ItemContent>
            <ItemActions>
              <div className="flex flex-col gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link href="/sign-in">Resend verification email</Link>
                </Button>
              </div>
            </ItemActions>
          </Item>
        )}
      </div>
    </AuthLayout>
  )
}

