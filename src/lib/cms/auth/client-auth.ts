"use client";

import { z } from "zod";

// Login schema for validation (client-side version)
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional().default(false),
});

// Client-side logout function
export async function logoutAdmin() {
  try {
    const response = await fetch("/api/cms/auth/logout", {
      method: "POST",
    });
    
    if (!response.ok) {
      throw new Error("Logout failed");
    }
    
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}

// Client-side login function
export async function loginAdmin(email: string, password: string, rememberMe: boolean = false) {
  try {
    const response = await fetch("/api/cms/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, rememberMe }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }
    
    return { success: true, admin: data.admin };
  } catch (error) {
    console.error("Login error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unknown error occurred" 
    };
  }
}
