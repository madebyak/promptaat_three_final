"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { FiMail, FiLock, FiAlertCircle } from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SessionProvider } from "next-auth/react";

// Simple login schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

type FormData = z.infer<typeof loginSchema>;

/**
 * Client component for the login page
 * This component handles the client-side rendering of the login form
 * and provides the SessionProvider for authentication
 */
export default function LoginClient() {
  return (
    <SessionProvider>
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
          <LoginFormInternal />
        </div>
      </div>
    </SessionProvider>
  );
}

// Internal login form component to avoid context issues
function LoginFormInternal() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const rememberMe = watch('rememberMe');

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [CMS] Login attempt for: ${data.email}`);
    
    try {
      // Admin authentication with NextAuth
      console.log(`[${timestamp}] [CMS] Calling NextAuth signIn for admin...`);
      const nextAuthResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        isAdmin: 'true', // Flag to indicate this is an admin login
        redirect: false,
        callbackUrl: '/cms/dashboard'
      });
      
      console.log(`[${timestamp}] [CMS] NextAuth result:`, nextAuthResult);
      
      if (!nextAuthResult?.ok) {
        console.error(`[${timestamp}] [CMS] Authentication failed:`, nextAuthResult?.error);
        throw new Error(nextAuthResult?.error || "Invalid email or password");
      }
      
      // Success - redirect to dashboard
      console.log(`[${timestamp}] [CMS] Authentication successful, redirecting to dashboard`);
      window.location.href = nextAuthResult.url || "/cms/dashboard";
    } catch (err) {
      console.error(`[${timestamp}] [CMS] Login error:`, err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Use English for the admin interface
  const translations = {
    title: 'Admin Login',
    subtitle: 'Enter your credentials to access the admin panel',
    email: 'Email address',
    emailPlaceholder: 'Enter your email',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    rememberMe: 'Remember me',
    signIn: 'Sign in',
    signingIn: 'Signing in...',
    errorTitle: 'Error',
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-md border-0">
      <CardHeader className="space-y-2 pb-8">
        <CardTitle className="text-2xl font-bold text-center">{translations.title}</CardTitle>
        <CardDescription className="text-center text-base">{translations.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <FiAlertCircle className="h-5 w-5" />
              <AlertTitle className="text-base">{translations.errorTitle}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2.5">
            <Label htmlFor="email" className="text-sm font-medium">
              {translations.email}
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <FiMail className="h-5 w-5" />
              </div>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={translations.emailPlaceholder}
                className="pl-10 h-12 text-base"
                dir="ltr"
                {...register("email")}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="password" className="text-sm font-medium">
              {translations.password}
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <FiLock className="h-5 w-5" />
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder={translations.passwordPlaceholder}
                className="pl-10 h-12 text-base"
                dir="ltr"
                {...register("password")}
                disabled={isLoading}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-start space-x-2 mt-2">
            <Checkbox 
              id="rememberMe" 
              checked={rememberMe}
              onCheckedChange={(checked) => setValue('rememberMe', checked as boolean)}
              disabled={isLoading}
              className="h-5 w-5"
            />
            <Label 
              htmlFor="rememberMe" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {translations.rememberMe}
            </Label>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-base mt-4"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" />
                {translations.signingIn}
              </span>
            ) : (
              translations.signIn
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
