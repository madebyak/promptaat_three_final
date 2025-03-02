import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma/client";
import { comparePassword } from "./password-validation";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          select: {
            id: true,
            email: true,
            passwordHash: true,
            firstName: true,
            lastName: true,
            emailVerified: true,
            profileImageUrl: true,
          },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isPasswordValid = await comparePassword(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.profileImageUrl,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.emailVerified = token.emailVerified as boolean;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
