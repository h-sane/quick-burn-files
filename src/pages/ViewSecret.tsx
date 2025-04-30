
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { SecretData } from '@/services/storage';
import { supabaseService } from '@/services/supabase';
import { extractSecretIdFromMaskedUrl } from '@/services/urlMasking';
import { Eye, Download, ArrowLeft, Clock, Trash, ShieldAlert } from 'lucide-react';

// Define valid status types
type SecretStatus = 'loading' | 'success' | 'expired' | 'destroyed' | 'not_found' | 'error';

const ViewSecret = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [secretData, setSecretData] = useState<SecretData | null>(null);
  const [status, setStatus] = useState<SecretStatus>('loading');
  const [remainingViews, setRemainingViews] = useState(0);
  const [isFinalView, setIsFinalView] = useState(false);

  useEffect(() => {
    if (!id) {
      setStatus('not_found');
      return;
    }

    const fetchSecret = async () => {
      try {
        const realId = extractSecretIdFromMaskedUrl(id) || id;
        console.log('Fetching secret with ID:', realId);
        
        const result = await supabaseService.retrieveSecret(realId);
        console.log('Secret fetch result:', result);
        
        setStatus(result.status as SecretStatus);
        
        if (result.data) {
          setSecretData(result.data);
          const viewsLeft = Math.max(0, result.data.maxViews - result.data.views);
          setRemainingViews(viewsLeft);
          setIsFinalView(viewsLeft === 0);

          if (result.status === 'success' && viewsLeft === 0) {
            toast.warning('This was the final view - content has self-destructed', {
              duration: 5000,
              important: true
            });
            
            // Force reload to prevent caching
            setTimeout(() => {
              window.location.search = `?t=${Date.now()}`;
            }, 3000);
          }
        }
      } catch (error) {
        console.error('Failed to retrieve secret', error);
        setStatus('not_found');
        toast.error('Failed to load secret');
      }
    };
    
    fetchSecret();

    // Handle browser back/refresh
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFinalView) {
        e.preventDefault();
        e.returnValue = 'This content has self-destructed. Going back will not restore it.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [id, isFinalView]);

  const downloadFile = () => {
    if (!secretData || secretData.type !== 'file') return;
    
    try {
      const link = document.createElement('a');
      link.href = secretData.content;
      link.download = secretData.fileName || 'download';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Clean up after download
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      }, 100);

      toast.success('Download started', {
        description: isFinalView ? 'File will be deleted after this download' : undefined
      });
      
      // If this is the final view, force refresh to show it's been destroyed
      if (isFinalView) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Download failed', error);
      toast.error('Failed to download file');
    }
  };

  const renderContentByStatus = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            <p className="mt-4 text-neutral-400">Decrypting content...</p>
          </div>
        );
        
      case 'success':
        if (!secretData) return null;
        
        return (
          <Card className="shadow-lg border border-neutral-800 bg-black/80 text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  {secretData.type === 'text' ? (
                    <span className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-blue-400" />
                      Secure Message
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Download className="h-5 w-5 text-blue-400" />
                      {secretData.fileName || 'Secure File'}
                    </span>
                  )}
                </CardTitle>
                
                <div className={`flex items-center gap-1 text-sm ${
                  isFinalView ? 'text-red-400' : 'text-neutral-400'
                }`}>
                  <Eye className="h-4 w-4" />
                  <span>
                    {isFinalView ? 'FINAL VIEW' : `${remainingViews} ${remainingViews === 1 ? 'view' : 'views'} left`}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {secretData.type === 'text' ? (
                <>
                  <Textarea
                    value={secretData.content}
                    readOnly
                    className="min-h-[200px] border-neutral-700 bg-black/50 text-white font-mono"
                  />
                  {isFinalView && (
                    <div className="mt-4 flex items-center gap-2 text-red-400 text-sm">
                      <ShieldAlert className="h-4 w-4" />
                      <span>This message will disappear after you leave this page</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-700 rounded-lg bg-black/40">
                  <p className="mb-4 text-lg text-neutral-200">
                    {secretData.fileName || 'File'} ({secretData.mimeType})
                  </p>
                  <Button 
                    onClick={downloadFile} 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    {isFinalView ? 'Download (Last Chance)' : 'Download File'}
                  </Button>
                  {isFinalView && (
                    <p className="mt-3 text-sm text-red-400 flex items-center gap-1">
                      <Trash className="h-4 w-4" />
                      File will be permanently deleted after download
                    </p>
                  )}
                </div>
              )}
              
              <div className="mt-6 flex items-center justify-between text-sm">
                <div className={`flex items-center ${
                  isFinalView ? 'text-red-400' : 'text-amber-500'
                }`}>
                  <Clock className="h-4 w-4 mr-1" />
                  {isFinalView ? (
                    <span className="flex items-center gap-1">
                      <Trash className="h-4 w-4" />
                      Deleting now...
                    </span>
                  ) : (
                    <span>Expires: {new Date(secretData.expiryDate).toLocaleString()}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      case 'expired':
        return (
          <Alert variant="destructive" className="border-amber-800 bg-black text-amber-500">
            <Clock className="h-5 w-5" />
            <AlertTitle>Content Expired</AlertTitle>
            <AlertDescription className="text-neutral-300">
              This secret expired on {secretData?.expiryDate?.toLocaleString()} and has been automatically deleted.
            </AlertDescription>
          </Alert>
        );
        
      case 'destroyed':
        return (
          <Alert variant="destructive" className="border-red-900 bg-black text-red-500">
            <Trash className="h-5 w-5" />
            <AlertTitle>Content Destroyed</AlertTitle>
            <AlertDescription className="text-neutral-300">
              This secret has been permanently deleted after viewing.
              <Button 
                variant="link" 
                className="text-blue-400 ml-2 p-0 h-auto" 
                onClick={() => navigate('/')}
              >
                Create a new secret
              </Button>
            </AlertDescription>
          </Alert>
        );
      
      case 'error':
        return (
          <Alert variant="destructive" className="border-red-800 bg-black text-red-500">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="text-neutral-300">
              There was an error accessing this secret.
              <Button 
                variant="link" 
                className="text-blue-400 ml-2 p-0 h-auto" 
                onClick={() => navigate('/')}
              >
                Return to safety
              </Button>
            </AlertDescription>
          </Alert>
        );
        
      case 'not_found':
      default:
        return (
          <Alert variant="destructive" className="border-neutral-800 bg-black text-neutral-400">
            <AlertTitle>Secret Not Found</AlertTitle>
            <AlertDescription className="text-neutral-300">
              This secret doesn't exist or has been permanently deleted.
              <Button 
                variant="link" 
                className="text-blue-400 ml-2 p-0 h-auto" 
                onClick={() => navigate('/')}
              >
                Return to safety
              </Button>
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <div className="min-h-screen py-8 vault-container">
      <div className="container max-w-3xl">
        <header className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center text-blue-400 hover:text-blue-300 transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to VanishVault</span>
          </Link>
        </header>
        
        <div className="space-y-8 animate-fade-in">
          {renderContentByStatus()}
          
          <div className="text-center text-sm text-neutral-500">
            <p>
              VanishVault - Secure content that disappears after viewing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSecret;
