import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"

// Re-export authOptions to fix import issues
export { authOptions }

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

export async function isAuthenticated() {
  const session = await getSession()
  return !!session?.user
}

export async function requireAuth() {
  const isAuthed = await isAuthenticated()
  if (!isAuthed) {
    throw new Error("Authentication required")
  }
}
