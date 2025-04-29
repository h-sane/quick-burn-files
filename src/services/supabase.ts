
import { supabase } from '@/integrations/supabase/client';
import { SecretData } from './storage';

// Interface for stored secrets in Supabase
export interface SupabaseSecretData {
  id: string;
  content: string;
  type: 'text' | 'file';
  file_name?: string;
  file_mime_type?: string;
  max_views: number;
  expiry_date: string;
  views: number;
  created_at: string;
}

export class SupabaseService {
  /**
   * Store a new secret in Supabase
   */
  async storeSecret(
    content: string,
    type: 'text' | 'file',
    maxViews: number,
    expiryDays: number,
    fileName?: string,
    fileMimeType?: string
  ): Promise<string> {
    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    
    // Insert into Supabase
    const { data, error } = await supabase
      .from('secrets')
      .insert({
        content,
        type,
        file_name: fileName,
        file_mime_type: fileMimeType,
        max_views: maxViews,
        expiry_date: expiryDate.toISOString(),
        views: 0
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Failed to store secret in Supabase', error);
      throw new Error('Failed to store secret');
    }
    
    return data.id;
  }

  /**
   * Retrieve and potentially destroy a secret
   */
  async retrieveSecret(id: string): Promise<{
    data: SecretData | null;
    status: 'success' | 'expired' | 'destroyed' | 'not_found';
  }> {
    try {
      // First try to get the secret
      const { data: secret, error } = await supabase
        .from('secrets')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error('Error retrieving secret:', error);
        return { data: null, status: 'not_found' };
      }
      
      if (!secret) {
        return { data: null, status: 'not_found' };
      }
      
      // Check if expired
      const now = new Date();
      if (now > new Date(secret.expiry_date)) {
        // Delete the expired secret
        await supabase
          .from('secrets')
          .delete()
          .eq('id', id);
        
        return { data: null, status: 'expired' };
      }
      
      // Increment view count
      const newViewCount = secret.views + 1;
      
      // Check if max views reached
      if (newViewCount >= secret.max_views) {
        // This is the last view, so return the data and then delete it
        const secretData: SecretData = {
          id: secret.id,
          content: secret.content,
          type: secret.type as 'text' | 'file',
          fileName: secret.file_name || undefined,
          mimeType: secret.file_mime_type || undefined,
          maxViews: secret.max_views,
          expiryDate: new Date(secret.expiry_date),
          views: newViewCount,
          encryptionKey: '', // No need for client-side encryption with Supabase
          destroyed: true
        };
        
        // Update the view count
        await supabase
          .from('secrets')
          .update({ views: newViewCount })
          .eq('id', id);
        
        // Delete if this was the last allowed view
        if (newViewCount >= secret.max_views) {
          await supabase
            .from('secrets')
            .delete()
            .eq('id', id);
        }
        
        return { data: secretData, status: 'success' };
      } else {
        // Update the view count
        await supabase
          .from('secrets')
          .update({ views: newViewCount })
          .eq('id', id);
        
        // Return the data without deleting
        const secretData: SecretData = {
          id: secret.id,
          content: secret.content,
          type: secret.type as 'text' | 'file',
          fileName: secret.file_name || undefined,
          mimeType: secret.file_mime_type || undefined,
          maxViews: secret.max_views,
          expiryDate: new Date(secret.expiry_date),
          views: newViewCount,
          encryptionKey: '', // No need for client-side encryption with Supabase
          destroyed: false
        };
        
        return { data: secretData, status: 'success' };
      }
    } catch (error) {
      console.error('Error in retrieveSecret:', error);
      return { data: null, status: 'not_found' };
    }
  }
}

export const supabaseService = new SupabaseService();
