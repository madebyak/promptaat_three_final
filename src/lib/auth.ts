import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./prisma/client"
import { comparePasswords } from "./crypto"

// Use secure cookies in production, regular cookies in development
const useSecureCookies = process.env.NODE_ENV === 'production';
const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `${useSecureCookies ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
        domain: cookieDomain
      }
    },
    callbackUrl: {
      name: `${useSecureCookies ? "__Secure-" : ""}next-auth.callback-url`,
      options: {
        sameSite: "none",
        path: "/",
        secure: true,
        domain: cookieDomain
      }
    },
    csrfToken: {
      name: `${useSecureCookies ? "__Host-" : ""}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true
      }
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user || !user.passwordHash) {
            return null
          }

          const isPasswordValid = await comparePasswords(
            credentials.password,
            user.passwordHash
          )

          if (!isPasswordValid) {
            return null
          }

          // Update last login time
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
          });

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            emailVerified: user.emailVerified,
            image: user.profileImageUrl,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        // Explicitly type the profile to include email_verified
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          emailVerified: Boolean(profile.email_verified),
          firstName: profile.given_name,
          lastName: profile.family_name,
          country: profile.locale?.split("-")[1] || "US",
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only allow sign in if email is verified for Google accounts
      if (account?.provider === "google" && profile && 'email_verified' in profile) {
        return Boolean(profile.email_verified);
      }

      // For credentials, we check in the authorize callback
      if (account?.provider === "credentials") {
        return true;
      }

      // Default allow sign in
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.provider = account?.provider;
      }

      // Return previous token if the user hasn't changed
      if (trigger !== "update" && trigger !== "signIn") {
        return token;
      }

      // Get the latest user data from the database
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          profileImageUrl: true,
          emailVerified: true,
          role: true,
          country: true,
        },
      });

      if (!dbUser) {
        return token;
      }

      // Check if profile needs completion
      const needsProfileCompletion = !dbUser.firstName || !dbUser.lastName || !dbUser.country;

      return {
        ...token,
        emailVerified: dbUser.emailVerified,
        isAdmin: dbUser.role === "ADMIN",
        role: dbUser.role,
        picture: dbUser.profileImageUrl,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        country: dbUser.country,
        needsProfileCompletion
      };
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Define a proper type for the extended user
        interface ExtendedUser {
          id: string;
          name?: string | null;
          email?: string | null;
          image?: string | null;
          role?: string;
          isAdmin?: boolean;
          emailVerified?: boolean;
          firstName?: string;
          lastName?: string;
          country?: string;
          needsProfileCompletion?: boolean;
        }
        
        // Use the defined type
        const user = session.user as ExtendedUser;
        user.id = token.id as string;
        user.role = token.role as string;
        user.isAdmin = token.isAdmin as boolean;
        user.image = token.picture as string | undefined;
        user.emailVerified = token.emailVerified as boolean;
        user.firstName = token.firstName as string;
        user.lastName = token.lastName as string;
        user.country = token.country as string;
        user.needsProfileCompletion = token.needsProfileCompletion as boolean;
      }
      return session;
    }
  },
  debug: process.env.NODE_ENV === "development",
}
