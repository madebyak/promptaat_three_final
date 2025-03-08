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
  try {
    if (!password) {
      console.error('[hashPassword] Password is empty or undefined');
      throw new Error('Password cannot be empty');
    }
    
    // Add a static salt to make the hash more secure
    const saltedPassword = `${password}__promptaat_salt__`;
    const msgBuffer = str2ab(saltedPassword);
    
    // Ensure crypto is available (browser or Node.js environment)
    if (!crypto || !crypto.subtle) {
      console.error('[hashPassword] Crypto API not available');
      throw new Error('Crypto API not available');
    }
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return ab2hex(hashBuffer);
  } catch (error) {
    console.error('[hashPassword] Error hashing password:', error);
    throw error;
  }
}

/**
 * Compare a password with a hash
 * @param password - The password to compare
 * @param hash - The hash to compare against
 * @returns A promise that resolves to true if the password matches the hash
 */
export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  try {
    if (!password || !hash) {
      console.error('[comparePasswords] Missing password or hash');
      return false;
    }
    
    const hashedPassword = await hashPassword(password);
    
    // Debug logging for production troubleshooting
    if (process.env.NODE_ENV === 'production') {
      console.log('[comparePasswords] Comparing passwords (masked):', {
        passwordLength: password.length,
        hashLength: hash.length,
        hashedPasswordLength: hashedPassword.length,
        match: hashedPassword === hash
      });
    }
    
    return hashedPassword === hash;
  } catch (error) {
    console.error('[comparePasswords] Error comparing passwords:', error);
    return false;
  }
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
