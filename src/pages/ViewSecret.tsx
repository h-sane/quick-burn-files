
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { SecretData } from '@/services/storage';
import { supabaseService } from '@/services/supabase';
import { extractSecretIdFromMaskedUrl } from '@/services/urlMasking';
import { Eye, Download, ArrowLeft, Clock, Trash } from 'lucide-react';

const ViewSecret = () => {
  const { id } = useParams<{ id: string }>();
  const [secretData, setSecretData] = useState<SecretData | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'expired' | 'destroyed' | 'not_found'>('loading');
  const [remainingViews, setRemainingViews] = useState(0);

  useEffect(() => {
    if (!id) {
      setStatus('not_found');
      return;
    }

    const fetchSecret = async () => {
      try {
        // Extract the real ID if this is a masked URL
        const realId = extractSecretIdFromMaskedUrl(id) || id;
        
        const result = await supabaseService.retrieveSecret(realId);
        setStatus(result.status);
        
        if (result.data) {
          setSecretData(result.data);
          setRemainingViews(Math.max(0, result.data.maxViews - result.data.views));
          
          if (result.status === 'success' && result.data.maxViews === result.data.views) {
            toast.info('This content will self-destruct after viewing');
          }
        }
      } catch (error) {
        console.error('Failed to retrieve secret', error);
        setStatus('not_found');
      }
    };
    
    fetchSecret();
  }, [id]);

  const downloadFile = () => {
    if (!secretData || secretData.type !== 'file') return;
    
    try {
      // For file type, content is stored as a data URL
      const link = document.createElement('a');
      link.href = secretData.content;
      link.download = secretData.fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('File download started');
    } catch (error) {
      console.error('Failed to download file', error);
      toast.error('Failed to download file');
    }
  };

  const renderContentByStatus = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Decrypting content...</p>
          </div>
        );
        
      case 'success':
        if (!secretData) return null;
        
        return (
          <Card className="shadow-lg border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  {secretData.type === 'text' ? (
                    <span className="flex items-center gap-1">
                      <Eye className="h-5 w-5 text-primary" />
                      Secure Message
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Download className="h-5 w-5 text-primary" />
                      {secretData.fileName || 'Secure File'}
                    </span>
                  )}
                </CardTitle>
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{remainingViews === 0 ? 'Last view' : `${remainingViews} ${remainingViews === 1 ? 'view' : 'views'} remaining`}</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {secretData.type === 'text' ? (
                <Textarea
                  value={secretData.content}
                  readOnly
                  className="min-h-[200px]"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary/20 rounded-lg">
                  <p className="mb-4 text-lg">
                    {secretData.fileName || 'File'} is ready for download
                  </p>
                  <Button onClick={downloadFile}>
                    <Download className="h-5 w-5 mr-2" />
                    Download File
                  </Button>
                </div>
              )}
              
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center text-amber-600 text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  {remainingViews === 0 ? (
                    <span className="flex items-center gap-1">
                      <Trash className="h-4 w-4" />
                      This content will self-destruct after viewing
                    </span>
                  ) : (
                    <span>Auto-delete in {new Date(secretData.expiryDate).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      case 'expired':
        return (
          <Alert>
            <Clock className="h-5 w-5" />
            <AlertTitle>Content Has Expired</AlertTitle>
            <AlertDescription>
              This secret has expired and has been automatically deleted.
            </AlertDescription>
          </Alert>
        );
        
      case 'destroyed':
        return (
          <Alert>
            <Trash className="h-5 w-5" />
            <AlertTitle>Content Has Self-Destructed</AlertTitle>
            <AlertDescription>
              This secret has already been viewed and has self-destructed.
            </AlertDescription>
          </Alert>
        );
        
      case 'not_found':
      default:
        return (
          <Alert>
            <AlertTitle>Content Not Found</AlertTitle>
            <AlertDescription>
              This secret doesn't exist or has been permanently deleted.
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <div className="min-h-screen py-8 vault-container">
      <div className="container max-w-3xl">
        <header className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center text-primary">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to VanishVault</span>
          </Link>
        </header>
        
        <div className="space-y-8 animate-fade-in">
          {renderContentByStatus()}
          
          <div className="text-center text-sm text-muted-foreground">
            <p>
              VanishVault - For secure, self-destructing content sharing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSecret;
