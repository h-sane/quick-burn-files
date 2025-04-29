
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Key } from 'lucide-react';
import { toast } from 'sonner';
import { generateMaskedUrl } from '@/services/urlMasking';

interface GeneratedLinkProps {
  secretId: string | null;
}

const GeneratedLink: React.FC<GeneratedLinkProps> = ({ secretId }) => {
  const [copied, setCopied] = useState(false);
  const [displayUrl, setDisplayUrl] = useState("");
  
  useEffect(() => {
    if (secretId) {
      // Create a fully masked URL that doesn't expose any domain
      const maskedId = generateMaskedUrl(secretId);
      setDisplayUrl(`secret/${maskedId}`);
    }
  }, [secretId]);
  
  if (!secretId) {
    return null;
  }
  
  // The real link that will be copied to clipboard
  const actualLink = `${window.location.origin}/view/${secretId}`;
  
  const copyToClipboard = async () => {
    try {
      // Copy the real link, not the masked display URL
      await navigator.clipboard.writeText(actualLink);
      setCopied(true);
      toast.success('Link copied to clipboard');
      
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy link', err);
      toast.error('Failed to copy link');
    }
  };
  
  return (
    <Card className="shadow-md border border-neutral-800 bg-black/80 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-center flex items-center justify-center gap-2">
          <Key className="h-5 w-5 text-blue-400" />
          Your Secret Link
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-center text-neutral-400">
          Share this link with the recipient. Remember that the content will self-destruct based on your settings.
        </p>
        
        <div className="flex items-center gap-2">
          <Input
            value={displayUrl}
            readOnly
            className="font-mono text-sm border-neutral-700 bg-black text-blue-400"
          />
          <Button
            size="sm"
            variant={copied ? "outline" : "default"}
            onClick={copyToClipboard}
            className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Copy className="h-4 w-4 mr-1" />
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-red-400 font-medium mt-2 animate-pulse-fade">
            Do not lose this link! For security, we have no way to recover it.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneratedLink;
