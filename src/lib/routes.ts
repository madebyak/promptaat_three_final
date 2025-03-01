export const routes = {
  auth: {
    login: (locale: string) => `/${locale}/auth/login`,
    register: (locale: string) => `/${locale}/auth/register`,
    forgotPassword: (locale: string) => `/${locale}/auth/forgot-password`,
    resetPassword: (locale: string) => `/${locale}/auth/reset-password`,
    verify: (locale: string) => `/${locale}/auth/verify`,
    error: (locale: string) => `/${locale}/auth/error`,
  },
  home: (locale: string) => `/${locale}`,
  about: (locale: string) => `/${locale}/about`,
  help: (locale: string) => `/${locale}/help`,
  user: {
    profile: (locale: string) => `/${locale}/profile`,
    myPrompts: (locale: string) => `/${locale}/my-prompts`,
    settings: (locale: string) => `/${locale}/settings`,
  },
} as const;

export type Routes = typeof routes;
