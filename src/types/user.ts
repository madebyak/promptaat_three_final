export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string | null;
  country: string;
  occupation: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date | null;
  emailVerified: boolean;
  verificationToken: string | null;
  verificationTokenExpires: Date | null;
}
