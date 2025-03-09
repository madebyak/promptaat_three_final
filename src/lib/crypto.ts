/**
 * Utility functions for password hashing and comparison using Web Crypto API
 * This is a more deployment-friendly alternative to bcrypt
 */

// Utility function to convert string to ArrayBuffer
function str2ab(str: string) {
  try {
    const buf = new ArrayBuffer(str.length * 2);
    const bufView = new Uint16Array(buf);
    for (let i = 0; i < str.length; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  } catch (error) {
    console.error('[str2ab] Error converting string to ArrayBuffer:', error);
    // Create a fallback buffer with the string
    const encoder = new TextEncoder();
    return encoder.encode(str).buffer;
  }
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
  const timestamp = new Date().toISOString();
  
  try {
    if (!password) {
      console.error(`[${timestamp}] [hashPassword] Password is empty or undefined`);
      throw new Error('Password cannot be empty');
    }
    
    // Add a static salt to make the hash more secure
    const saltedPassword = `${password}promptaat-static-salt`;
    
    // Log the salting process (without revealing the actual password)
    console.log(`[${timestamp}] [hashPassword] Salting password of length ${password.length}`);
    
    const msgBuffer = str2ab(saltedPassword);
    
    // Ensure crypto is available (browser or Node.js environment)
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      console.error(`[${timestamp}] [hashPassword] Crypto API not available`);
      
      // Fallback for environments where crypto.subtle is not available
      // In a Node.js environment, we would use the crypto module
      // But we'll implement a simple fallback here using string manipulation
      // This is not cryptographically secure but allows the app to function
      console.error(`[${timestamp}] [hashPassword] Using simple fallback hashing mechanism - NOT SECURE FOR PRODUCTION`);
      
      // Create a simple hash from the salted password
      // This is NOT secure and should only be used as a last resort
      let simpleHash = '';
      for (let i = 0; i < saltedPassword.length; i++) {
        simpleHash += saltedPassword.charCodeAt(i).toString(16);
      }
      
      // Ensure the hash is 64 characters (similar to SHA-256 output)
      while (simpleHash.length < 64) {
        simpleHash += '0';
      }
      if (simpleHash.length > 64) {
        simpleHash = simpleHash.substring(0, 64);
      }
      
      return simpleHash;
    }
    
    console.log(`[${timestamp}] [hashPassword] Using Web Crypto API for hashing`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const result = ab2hex(hashBuffer);
    
    console.log(`[${timestamp}] [hashPassword] Successfully hashed password`);
    return result;
  } catch (error) {
    console.error(`[${timestamp}] [hashPassword] Error hashing password:`, error);
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
  const timestamp = new Date().toISOString();
  
  try {
    // Validate inputs
    if (!password) {
      console.error(`[${timestamp}] [comparePasswords] Password is empty or undefined`);
      return false;
    }
    
    if (!hash) {
      console.error(`[${timestamp}] [comparePasswords] Hash is empty or undefined`);
      return false;
    }
    
    // Log comparison attempt (without revealing sensitive data)
    console.log(`[${timestamp}] [comparePasswords] Comparing password of length ${password.length} with hash of length ${hash.length}`);
    
    // Hash the provided password using the same algorithm
    let hashedPassword;
    try {
      hashedPassword = await hashPassword(password);
    } catch (hashError) {
      console.error(`[${timestamp}] [comparePasswords] Error hashing password for comparison:`, hashError);
      return false;
    }
    
    // Debug logging for troubleshooting in all environments
    console.log(`[${timestamp}] [comparePasswords] Comparison details:`, {
      passwordLength: password.length,
      hashLength: hash.length,
      hashedPasswordLength: hashedPassword.length,
      // Only log first and last two characters of hashes for security
      hashPrefix: hash.substring(0, 2),
      hashSuffix: hash.substring(hash.length - 2),
      hashedPasswordPrefix: hashedPassword.substring(0, 2),
      hashedPasswordSuffix: hashedPassword.substring(hashedPassword.length - 2),
      match: hashedPassword === hash
    });
    
    // Perform the comparison
    const isMatch = hashedPassword === hash;
    console.log(`[${timestamp}] [comparePasswords] Password comparison result: ${isMatch}`);
    
    return isMatch;
  } catch (error) {
    console.error(`[${timestamp}] [comparePasswords] Error comparing passwords:`, error);
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
