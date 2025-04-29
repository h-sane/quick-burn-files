/**
 * Generates a short, masked URL that hides the original domain
 * @param secretId The ID of the secret
 * @returns A shortened URL path that can be appended to any domain
 */
export const generateMaskedUrl = (secretId: string): string => {
  // For security, we'll keep the ID but use a different format
  // This creates a simple masked URL that doesn't expose the domain but still contains the ID
  return `vv-${secretId.substring(0, 8)}`;
};

/**
 * Extracts the secret ID from a masked URL
 * @param maskedUrl The masked URL path
 * @returns The original secret ID
 */
export const extractSecretIdFromMaskedUrl = (maskedUrl: string): string | null => {
  // Check if it's our masked format
  if (maskedUrl.startsWith('vv-')) {
    // We would need to retrieve the full ID from database using the prefix
    // For now, return a simplified version to demonstrate the concept
    // In a real implementation, you'd need to store a mapping of short IDs to real IDs
    return maskedUrl.substring(3); // Remove 'vv-' prefix
  }
  
  // If it's not a masked URL, it might be the full ID
  return maskedUrl;
};
