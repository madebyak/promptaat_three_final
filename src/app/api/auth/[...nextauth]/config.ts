export const authConfig = {
  providers: [
    // Your providers
  ],
  // Specify which routes should NOT use Edge Runtime
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  },
  // Use Node.js runtime for auth routes
  runtime: 'nodejs'
}
