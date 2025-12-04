import { apiGetClient } from "@/lib/api-client-client"
import type { EmailUser } from "@/components/ui/email-tag-input"

export async function getUsers(): Promise<EmailUser[]> {
  try {
    const response = await apiGetClient("users")
    
    // Transform API response to EmailUser format
    return response.data.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    }))
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return []
  }
}

