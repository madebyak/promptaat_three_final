import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma/client";
import { comparePassword } from "./password-validation";

// Fallback secret for development and testing
// In production, this should be set as an environment variable
const DEFAULT_SECRET = "promptaat_default_secret_do_not_use_in_production";

// Get the NextAuth secret with fallback
const getNextAuthSecret = () => {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.warn('[AUTH WARNING] NEXTAUTH_SECRET is not set. Using default secret. This is not secure for production.');
    return DEFAULT_SECRET;
  }
  return secret;
};

// Get the correct base URL for the application
// This is important for callbacks and redirects
const getBaseUrl = () => {
  // In production, use NEXTAUTH_URL if available
  if (process.env.NEXTAUTH_URL) {
    // Ensure the URL is properly formatted (has protocol and no trailing slash)
    let url = process.env.NEXTAUTH_URL.trim();
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }
    // Remove trailing slash if present
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    console.log(`[AUTH] Using NEXTAUTH_URL: ${url}`);
    return url;
  }
  
  // In Vercel deployments, use VERCEL_URL
  if (process.env.VERCEL_URL) {
    const url = `https://${process.env.VERCEL_URL}`;
    console.log(`[AUTH] Using VERCEL_URL: ${url}`);
    return url;
  }
  
  // Fallback for development
  console.log('[AUTH] Using default localhost URL');
  return 'http://localhost:3000';
};

// Log the configuration in production to help with debugging
if (process.env.NODE_ENV === 'production') {
  console.log('[AUTH CONFIG] Environment:', {
    nodeEnv: process.env.NODE_ENV,
    baseUrl: getBaseUrl(),
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
  });
}

// Debug function to safely log authentication issues
const debugLog = (message: string, data?: Record<string, unknown>) => {
  console.log(`[AUTH DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

interface ExtendedUser extends User {
  emailVerified: boolean;
}

export const authOptions: NextAuthOptions = {
  // NextAuth.js doesn't have a direct URL property in the options
  // We'll use the callbacks to ensure proper URL handling
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          debugLog('Authorization attempt', { email: credentials?.email });
          
          if (!credentials?.email || !credentials?.password) {
            debugLog('Missing credentials');
            return null;
          }

          let user;
          try {
            user = await prisma.user.findUnique({
              where: {
                email: credentials.email,
              },
              select: {
                id: true,
                email: true,
                passwordHash: true, // Using passwordHash from Prisma schema
                firstName: true,
                lastName: true,
                emailVerified: true,
                profileImageUrl: true,
              },
            });
          } catch (dbError) {
            debugLog('Database error during user lookup', { error: String(dbError) });
            throw new Error('Database connection error');
          }

          if (!user || !user.passwordHash) {
            debugLog('User not found or missing password hash');
            return null;
          }

          let isPasswordValid;
          try {
            isPasswordValid = await comparePassword(
              credentials.password,
              user.passwordHash
            );
          } catch (passwordError) {
            debugLog('Password comparison error', { error: String(passwordError) });
            throw new Error('Password validation error');
          }

          if (!isPasswordValid) {
            debugLog('Invalid password');
            return null;
          }

          debugLog('Authentication successful', { userId: user.id });
          
          return {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.profileImageUrl,
          } as ExtendedUser;
        } catch (error) {
          debugLog('Unexpected error in authorize function', { error: String(error) });
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  // We'll handle redirects in the components instead of hardcoding paths here
  // This allows us to include the locale in the redirect paths
  pages: {
    // These paths are relative to the locale and will be prepended with the locale in the components
    signIn: "/auth/login",
    error: "/auth/error",
    // Special handling for CMS routes
    // The CMS login page is at a different path
    newUser: "/cms/dashboard", // Redirect to dashboard after registration
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.emailVerified = (user as ExtendedUser).emailVerified;
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
    async redirect({ url }) {
      // Handle redirects properly regardless of the domain
      // This ensures authentication works with multiple domains
      const baseUrlFromEnv = getBaseUrl();
      
      // Special handling for CMS routes to prevent circular redirects
      if (url.includes('/cms/auth/login')) {
        // If we're trying to redirect to the login page with a callback to itself,
        // just go to the login page without the callback
        if (url.includes('callbackUrl=%2Fcms%2Fauth%2Flogin')) {
          return `${baseUrlFromEnv}/cms/auth/login`;
        }
      }
      
      // If the URL is relative, prepend the base URL
      if (url.startsWith('/')) {
        return `${baseUrlFromEnv}${url}`;
      }
      // If the URL is already absolute but on the same site, allow it
      else if (url.startsWith(baseUrlFromEnv)) {
        return url;
      }
      // Default to the base URL for external URLs (security measure)
      return baseUrlFromEnv;
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: getNextAuthSecret(),
  logger: {
    error(code, metadata) {
      console.error(`[Auth Error] ${code}`, metadata);
    },
    warn(code) {
      console.warn(`[Auth Warning] ${code}`);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Auth Debug] ${code}`, metadata);
      }
    },
  },
};
