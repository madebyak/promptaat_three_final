import { jwtVerify, SignJWT } from "jose";

// Get the JWT secret with proper fallback and logging
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.warn('[JWT WARNING] JWT_SECRET is not set. Using fallback secret. This is not secure for production.');
    return "fallback-secret-key-for-jwt";
  }
  return secret;
};

const secretKey = getJwtSecret();
const key = new TextEncoder().encode(secretKey);

// Define a type for the JWT payload
type JWTPayload = {
  userId?: string;
  email?: string;
  role?: string;
  exp?: number;
  [key: string]: unknown; // Allow for additional properties if needed
};

export async function encrypt(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m") // Short expiration time for security
    .sign(key);
}

export async function decrypt(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as JWTPayload;
  } catch (error) {
    console.error('Error decrypting JWT token:', error);
    return {}; // Return empty object on error
  }
}
