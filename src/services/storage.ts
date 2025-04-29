
import { encryptData, decryptData, generateSecureId, generateEncryptionKey } from './encryption';

// Interface for stored secrets
export interface SecretData {
  id: string;
  content: string; // Encrypted content
  type: 'text' | 'file';
  fileName?: string;
  mimeType?: string;
  maxViews: number;
  expiryDate: Date;
  views: number;
  encryptionKey: string;
  destroyed: boolean;
}

// Using localStorage for storage in this prototype
// In a real app, you would use a secure database
class StorageService {
  private readonly STORAGE_KEY = 'vanishvault_secrets';

  private getSecrets(): Record<string, SecretData> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return {};
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse secrets', e);
      return {};
    }
  }

  private saveSecrets(secrets: Record<string, SecretData>): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(secrets));
  }

  /**
   * Store a new secret
   */
  storeSecret(
    content: string, 
    type: 'text' | 'file', 
    maxViews: number, 
    expiryDays: number,
    fileName?: string,
    mimeType?: string
  ): string {
    const id = generateSecureId();
    const encryptionKey = generateEncryptionKey();
    const encryptedContent = encryptData(content, encryptionKey);
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    
    const secretData: SecretData = {
      id,
      content: encryptedContent,
      type,
      fileName,
      mimeType,
      maxViews,
      expiryDate,
      views: 0,
      encryptionKey,
      destroyed: false
    };
    
    const secrets = this.getSecrets();
    secrets[id] = secretData;
    this.saveSecrets(secrets);
    
    return id;
  }

  /**
   * Retrieve and potentially destroy a secret
   */
  retrieveSecret(id: string): { data: SecretData | null; status: 'success' | 'expired' | 'destroyed' | 'not_found' } {
    const secrets = this.getSecrets();
    const secret = secrets[id];
    
    if (!secret) {
      return { data: null, status: 'not_found' };
    }
    
    if (secret.destroyed) {
      return { data: null, status: 'destroyed' };
    }
    
    const now = new Date();
    if (now > new Date(secret.expiryDate)) {
      secret.destroyed = true;
      this.saveSecrets(secrets);
      return { data: null, status: 'expired' };
    }
    
    // Increment view count
    secret.views += 1;
    
    // Check if max views reached
    if (secret.views >= secret.maxViews) {
      const returnData = { ...secret };
      
      // Decrypt content before returning
      returnData.content = decryptData(returnData.content, returnData.encryptionKey);
      
      // Mark as destroyed after successful read
      secret.destroyed = true;
      this.saveSecrets(secrets);
      
      return { data: returnData, status: 'success' };
    }
    
    // Not yet destroyed, but update view count
    this.saveSecrets(secrets);
    
    const returnData = { ...secret };
    returnData.content = decryptData(returnData.content, returnData.encryptionKey);
    
    return { data: returnData, status: 'success' };
  }

  /**
   * Clean up expired secrets
   */
  cleanupExpiredSecrets(): void {
    const secrets = this.getSecrets();
    const now = new Date();
    let changed = false;
    
    Object.keys(secrets).forEach(id => {
      const secret = secrets[id];
      if (now > new Date(secret.expiryDate) && !secret.destroyed) {
        secret.destroyed = true;
        changed = true;
      }
    });
    
    if (changed) {
      this.saveSecrets(secrets);
    }
  }
}

export const storageService = new StorageService();

// Clean up expired secrets on load
storageService.cleanupExpiredSecrets();
// Set up periodic cleanup
setInterval(() => storageService.cleanupExpiredSecrets(), 60000); // Every minute
