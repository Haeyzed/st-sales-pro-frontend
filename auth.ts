import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // Mock authentication - accept any email/password combination
        // In production, replace this with actual authentication logic
        if (credentials?.email && credentials?.password) {
          // Simulate a delay for realistic behavior
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // Mock user data
          const user = {
            id: "1",
            accountNo: "ACC001",
            email: credentials.email as string,
            name: credentials.email.split("@")[0],
            role: ["user"],
          }

          return user
        }
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.accountNo = (user as any).accountNo
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).accountNo = token.accountNo
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
})







