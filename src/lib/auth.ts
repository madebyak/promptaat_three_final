import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./prisma/client"
import { comparePasswords } from "./crypto"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? `__Secure-next-auth.session-token` 
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production' 
        ? `__Secure-next-auth.callback-url` 
        : `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production' 
        ? `__Host-next-auth.csrf-token` 
        : `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
    newUser: "/auth/welcome"
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
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          firstName: profile.given_name,
          lastName: profile.family_name,
          emailVerified: true,
          googleId: profile.sub,
        }
      },
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider === "google") {
        return true;
      }

      // For credentials provider, check if email is verified
      if (account?.provider === "credentials") {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email as string },
        });

        if (!dbUser) {
          return false;
        }

        // Check if user's email is verified
        if (!dbUser.emailVerified) {
          return `/auth/verify-email?email=${encodeURIComponent(
            dbUser.email
          )}`;
        }

        // Update last login timestamp
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { lastLoginAt: new Date() },
        });

        return true;
      }

      // Default allow sign in
      return true;
    },
    async session({ token, session }) {
      if (token) {
        // Use type assertion to satisfy TypeScript
        const user = session.user as {
          id: string;
          name?: string | null;
          email?: string | null;
          image?: string | null;
          isAdmin: boolean;
          role: string;
          emailVerified: boolean;
          firstName: string;
          lastName: string;
          country: string;
          needsProfileCompletion: boolean;
        };
        
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
    },
    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (account) {
        token.id = user.id;
        token.provider = account.provider;
      }

      // Return previous token if the user hasn't changed
      const dbUser = await prisma.user.findFirst({
        where: {
          email: token.email!,
        },
      });

      if (!dbUser) {
        return token;
      }

      // Handle profile update
      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }

      // Check if the user needs to complete their profile (for Google users)
      const needsProfileCompletion = 
        dbUser.googleId && dbUser.country === "Unknown";

      return {
        id: dbUser.id,
        name: `${dbUser.firstName} ${dbUser.lastName}`,
        email: dbUser.email,
        picture: dbUser.profileImageUrl,
        emailVerified: dbUser.emailVerified,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        country: dbUser.country,
        needsProfileCompletion
      };
    }
  }
}
