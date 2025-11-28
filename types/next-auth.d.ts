import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    email?: string | null
    name?: string | null
    token?: string
    roles?: string[]
    permissions?: string[]
  }

  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      token?: string
      roles?: string[]
      permissions?: string[]
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email?: string | null
    name?: string | null
    token?: string
    tokenExpires?: number
    roles?: string[]
    permissions?: string[]
  }
}


