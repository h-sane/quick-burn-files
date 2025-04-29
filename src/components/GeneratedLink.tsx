
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface GeneratedLinkProps {
  secretId: string | null;
}

const GeneratedLink: React.FC<GeneratedLinkProps> = ({ secretId }) => {
  const [copied, setCopied] = useState(false);
  
  if (!secretId) {
    return null;
  }
  
  const link = `${window.location.origin}/view/${secretId}`;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(link);
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
            value={link}
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
