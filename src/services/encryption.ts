
// Simple encryption service for prototype purposes
// In a production app, you would use a proper cryptography library

/**
 * Encrypts a string with a simple XOR cipher (for demonstration only)
 * In a real app, use a proper encryption library
 */
export const encryptData = (data: string, key: string): string => {
  let result = '';
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result); // Base64 encode the result
};

/**
 * Decrypts a string encrypted with encryptData
 */
export const decryptData = (encryptedData: string, key: string): string => {
  const data = atob(encryptedData); // Base64 decode
  let result = '';
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return result;
};

/**
 * Generate a secure random ID
 */
export const generateSecureId = (): string => {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Generate a random encryption key
 */
export const generateEncryptionKey = (): string => {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => String.fromCharCode(b % 94 + 33)) // Printable ASCII
    .join('');
};
