import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { login, getMe } from "@/lib/api/auth"

type AuthUser = {
  id: string
  email: string
  name: string
  token: string
  roles: string[]
  permissions: string[]
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const result = await login(
            credentials.email as string,
            credentials.password as string
          )

          const authUser: AuthUser = {
            id: String(result.user.id),
            email: result.user.email,
            name: result.user.name,
            token: result.token,
            roles: result.user.roles || [],
            permissions: result.user.permissions || [],
          }
          return authUser
        } catch (error) {
          console.error("Login error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user) {
        const authUser = user as AuthUser
        token.id = authUser.id
        token.email = authUser.email
        token.name = authUser.name
        token.token = authUser.token
        token.roles = authUser.roles
        token.permissions = authUser.permissions
        token.tokenExpires = Date.now() + 60 * 60 * 1000 // 1 hour
      }

      // Refresh token if it's about to expire (within 5 minutes)
      if (token.tokenExpires && Date.now() >= (token.tokenExpires as number) - 5 * 60 * 1000) {
        try {
          // Use the token from the current session to refresh
          const currentToken = token.token as string
          if (!currentToken) {
            return null
          }

          // Make refresh request with current token
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
          const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${currentToken}`,
              "Accept": "application/json",
            },
            credentials: "include",
          })

          if (!response.ok) {
            throw new Error("Token refresh failed")
          }

          const data = (await response.json()) as { data: { token: string } }
          token.token = data.data.token
          token.tokenExpires = Date.now() + 60 * 60 * 1000 // 1 hour
        } catch (error) {
          console.error("Token refresh error:", error)
          // Token refresh failed, user will need to re-login
          return null
        }
      }

      // Update session if triggered
      if (trigger === "update") {
        try {
          const user = await getMe()
          token.id = String(user.id)
          token.email = user.email
          token.name = user.name
          token.roles = (user.roles || []) as string[]
          token.permissions = (user.permissions || []) as string[]
        } catch (error) {
          console.error("Session update error:", error)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        const user = session.user as {
          id: string
          email?: string | null
          name?: string | null
          token?: string
          roles?: string[]
          permissions?: string[]
        }
        user.token = (token.token as string) || ""
        user.roles = (token.roles as string[]) || []
        user.permissions = (token.permissions as string[]) || []
      }
      return session
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
})
