
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { generateMaskedUrl } from '@/services/urlMasking';

interface GeneratedLinkProps {
  secretId: string | null;
}

const GeneratedLink: React.FC<GeneratedLinkProps> = ({ secretId }) => {
  const [copied, setCopied] = useState(false);
  const [maskedUrl, setMaskedUrl] = useState("");
  
  useEffect(() => {
    if (secretId) {
      // Generate a masked URL
      const shortId = generateMaskedUrl(secretId);
      
      // Create the full URL but remove the domain part for display
      const fullUrl = `${window.location.origin}/view/${secretId}`;
      // Replace the domain with a generic "vanishvault.com" domain in displayed URL
      const displayUrl = fullUrl.replace(window.location.host, 'vanishvault.com');
      
      setMaskedUrl(displayUrl);
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
    <Card className="shadow-md border-2 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-center">Your Secret Link</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-center text-muted-foreground">
          Share this link with the recipient. Remember that the content will self-destruct based on your settings.
        </p>
        
        <div className="flex items-center gap-2">
          <Input
            value={maskedUrl}
            readOnly
            className="font-mono text-sm"
          />
          <Button
            size="sm"
            variant={copied ? "outline" : "default"}
            onClick={copyToClipboard}
            className="flex-shrink-0"
          >
            <Copy className="h-4 w-4 mr-1" />
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        
        <div className="text-center animate-pulse-fade">
          <p className="text-xs text-red-500 font-medium mt-2">
            Do not lose this link! For security, we have no way to recover it.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneratedLink;
