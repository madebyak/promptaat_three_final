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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// Removed next-intl dependency

// Define the login schema directly here to avoid circular dependencies
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

type FormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Default to English for the admin interface
  const isRtl = false;

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

    try {
      // Use NextAuth's signIn function with redirect: false to handle errors properly
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false, // Prevent automatic redirects to control the flow
      });
      
      console.log("Authentication result:", result);
      
      // Check for authentication errors
      if (!result?.ok) {
        setError("Invalid email or password. Please try again.");
        return;
      }
      
      // If authentication is successful, manually redirect to dashboard
      // This avoids redirect loops by giving us more control over the redirect flow
      window.location.href = "/cms/dashboard";
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred during login");
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
            <Label htmlFor="email" className={`text-sm font-medium ${isRtl ? 'text-right block' : ''}`}>
              {translations.email}
            </Label>
            <div className="relative">
              <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-muted-foreground`}>
                <FiMail className="h-5 w-5" />
              </div>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={translations.emailPlaceholder}
                className={`${isRtl ? 'text-right pr-10' : 'pl-10'} h-12 text-base`}
                dir={isRtl ? "rtl" : "ltr"}
                {...register("email")}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className={`text-sm text-destructive mt-1 ${isRtl ? 'text-right' : ''}`}>{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="password" className={`text-sm font-medium ${isRtl ? 'text-right block' : ''}`}>
              {translations.password}
            </Label>
            <div className="relative">
              <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-muted-foreground`}>
                <FiLock className="h-5 w-5" />
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder={translations.passwordPlaceholder}
                className={`${isRtl ? 'text-right pr-10' : 'pl-10'} h-12 text-base`}
                dir={isRtl ? "rtl" : "ltr"}
                {...register("password")}
                disabled={isLoading}
              />
            </div>
            {errors.password && (
              <p className={`text-sm text-destructive mt-1 ${isRtl ? 'text-right' : ''}`}>{errors.password.message}</p>
            )}
          </div>

          <div className={`flex items-center ${isRtl ? 'flex-row-reverse justify-end' : 'justify-start'} space-x-2 ${isRtl ? 'space-x-reverse' : ''} mt-2`}>
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
