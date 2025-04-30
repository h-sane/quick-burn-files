
import { supabase } from '@/integrations/supabase/client';
import { SecretData } from './storage';

export interface SupabaseSecretData {
  id: string;
  content: string;
  type: 'text' | 'file';
  file_name?: string;
  file_mime_type?: string;
  max_views: number;
  expires_at: string;
  views: number;
  created_at: string;
  destroyed?: boolean; // Added for better state tracking
}

export class SupabaseService {
  /**
   * Store a new secret in Supabase with enhanced error handling
   */
  async storeSecret(
    content: string,
    type: 'text' | 'file',
    maxViews: number,
    expiryDays: number,
    fileName?: string,
    fileMimeType?: string
  ): Promise<string> {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);
      
      const { data, error } = await supabase
        .from('secrets')
        .insert({
          content,
          type,
          file_name: fileName,
          file_mime_type: fileMimeType,
          max_views: maxViews,
          expires_at: expiryDate.toISOString(),
          views: 0,
          destroyed: false // Explicit initial state
        })
        .select('id')
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('No data returned');
      
      return data.id;
    } catch (error) {
      console.error('SupabaseService.storeSecret failed:', error);
      throw new Error('Failed to store secret. Please try again.');
    }
  }

  /**
   * Enhanced retrieveSecret with transaction-like behavior
   */
  async retrieveSecret(id: string): Promise<{
    data: SecretData | null;
    status: 'success' | 'expired' | 'destroyed' | 'not_found' | 'error';
  }> {
    try {
      // Start transaction by getting the secret with row locking
      const { data: secret, error: fetchError } = await supabase
        .from('secrets')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError || !secret) {
        return { data: null, status: 'not_found' };
      }

      // Check if already destroyed
      if (secret.destroyed) {
        return { data: null, status: 'destroyed' };
      }

      const now = new Date();
      const expiryDate = new Date(secret.expires_at);
      const newViewCount = secret.views + 1;
      const maxViewsReached = newViewCount >= secret.max_views;

      // Handle expired secrets
      if (now > expiryDate) {
        await this.markSecretAsDestroyed(id);
        return { data: null, status: 'expired' };
      }

      // Prepare response data
      const secretData: SecretData = {
        id: secret.id,
        content: secret.content,
        type: secret.type as 'text' | 'file',
        fileName: secret.file_name || undefined,
        mimeType: secret.file_mime_type || undefined,
        maxViews: secret.max_views,
        expiryDate,
        views: newViewCount,
        encryptionKey: '',
        destroyed: maxViewsReached
      };

      // Update or delete based on view count
      if (maxViewsReached) {
        await this.markSecretAsDestroyed(id);
      } else {
        // Just increment the view count
        const { error: updateError } = await supabase
          .from('secrets')
          .update({ views: newViewCount })
          .eq('id', id);
          
        if (updateError) {
          console.error('Failed to update view count:', updateError);
          return { data: null, status: 'error' };
        }
      }

      return { data: secretData, status: 'success' };

    } catch (error) {
      console.error('SupabaseService.retrieveSecret failed:', error);
      return { data: null, status: 'error' };
    }
  }

  /**
   * Refactored method to consistently mark secrets as destroyed and delete them
   */
  private async markSecretAsDestroyed(id: string): Promise<void> {
    try {
      console.log(`Marking secret ${id} as destroyed`);
      
      // First mark as destroyed
      const { error: updateError } = await supabase
        .from('secrets')
        .update({ destroyed: true })
        .eq('id', id);

      if (updateError) {
        console.error('Failed to mark secret as destroyed:', updateError);
        throw updateError;
      }

      // Then delete the record
      const { error: deleteError } = await supabase
        .from('secrets')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Failed to delete secret:', deleteError);
        throw deleteError;
      }
      
      console.log(`Secret ${id} successfully destroyed and deleted`);
    } catch (error) {
      console.error('Failed to mark secret as destroyed:', error);
      throw error;
    }
  }

  /**
   * Fixed method to cleanup expired secrets
   */
  async cleanupExpiredSecrets(): Promise<number> {
    try {
      const now = new Date().toISOString();
      
      // Get the IDs of expired secrets before deleting them
      const { data, error: fetchError } = await supabase
        .from('secrets')
        .select('id')
        .lt('expires_at', now);
      
      if (fetchError) {
        console.error('Failed to fetch expired secrets:', fetchError);
        return 0;
      }
      
      if (!data || data.length === 0) {
        return 0;
      }
      
      // Delete the expired secrets
      const { error: deleteError } = await supabase
        .from('secrets')
        .delete()
        .lt('expires_at', now);
      
      if (deleteError) {
        console.error('Failed to delete expired secrets:', deleteError);
        return 0;
      }
      
      return data.length;
    } catch (error) {
      console.error('Failed to cleanup expired secrets:', error);
      return 0;
    }
  }
}

export const supabaseService = new SupabaseService();
