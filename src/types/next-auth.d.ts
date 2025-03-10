import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      emailVerified: boolean
      firstName: string
      lastName: string
      country: string
      needsProfileCompletion: boolean
    } & DefaultSession["user"]
  }
}
