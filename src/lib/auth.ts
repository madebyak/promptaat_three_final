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
    async signIn({ user, account, profile }) {
      // For Google sign-in, we need to check if this is a new user
      if (account?.provider === "google" && profile) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
        });

        if (existingUser) {
          // Update Google ID if not set
          if (!existingUser.googleId) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { 
                googleId: user.id,
                lastLoginAt: new Date(),
                emailVerified: true
              }
            });
          } else {
            // Just update login time
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { lastLoginAt: new Date() }
            });
          }
        } else {
          // Create new user for Google sign-in
          // Note: Country will be requested in a follow-up modal
          await prisma.user.create({
            data: {
              email: user.email!,
              firstName: (profile as any).given_name || "",
              lastName: (profile as any).family_name || "",
              googleId: user.id,
              emailVerified: true,
              country: "Unknown", // Will be updated later
              lastLoginAt: new Date(),
              profileImageUrl: user.image || "/profile_avatars/default_profile.jpg"
            }
          });
        }
      }
      
      return true;
    },
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string | undefined;
        session.user.emailVerified = token.emailVerified as boolean;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.country = token.country as string;
        session.user.needsProfileCompletion = token.needsProfileCompletion as boolean;
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
