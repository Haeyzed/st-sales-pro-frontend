import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    accountNo?: string
    role?: string[]
  }

  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      accountNo?: string
      role?: string[]
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    accountNo?: string
    role?: string[]
  }
}
