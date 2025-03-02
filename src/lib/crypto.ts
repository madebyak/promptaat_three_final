/**
 * Utility functions for password hashing and comparison using Web Crypto API
 * This is a more deployment-friendly alternative to bcrypt
 */

// Utility function to convert string to ArrayBuffer
function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length * 2);
  const bufView = new Uint16Array(buf);
  for (let i = 0; i < str.length; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

// Utility function to convert ArrayBuffer to hex string
function ab2hex(buffer: ArrayBuffer): string {
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a password using SHA-256
 * @param password - The password to hash
 * @returns A promise that resolves to the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  // Add a static salt to make the hash more secure
  const saltedPassword = `${password}__promptaat_salt__`;
  const msgBuffer = str2ab(saltedPassword);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return ab2hex(hashBuffer);
}

/**
 * Compare a password with a hash
 * @param password - The password to compare
 * @param hash - The hash to compare against
 * @returns A promise that resolves to true if the password matches the hash
 */
export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
}

/**
 * Generate a random string of specified length
 * @param length - The length of the string to generate
 * @returns A promise that resolves to a random string
 */
export async function generateRandomString(length: number): Promise<string> {
  const buffer = new Uint8Array(length);
  crypto.getRandomValues(buffer);
  return ab2hex(buffer.buffer);
}
