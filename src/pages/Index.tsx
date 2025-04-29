
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import FileUpload from '@/components/FileUpload';
import MessageInput from '@/components/MessageInput';
import ExpirationOptions from '@/components/ExpirationOptions';
import GeneratedLink from '@/components/GeneratedLink';
import { storageService } from '@/services/storage';
import { toast } from 'sonner';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'message' | 'file'>('message');
  const [message, setMessage] = useState('');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileMimeType, setFileMimeType] = useState('');
  const [expiryDays, setExpiryDays] = useState(7);
  const [maxViews, setMaxViews] = useState(1);
  const [secretId, setSecretId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileSelect = (content: string, name: string, mimeType: string) => {
    setFileContent(content);
    setFileName(name);
    setFileMimeType(mimeType);
    toast.success(`File "${name}" selected`);
  };

  const handleMessageChange = (newMessage: string) => {
    setMessage(newMessage);
  };

  const handleCreateSecret = () => {
    if (activeTab === 'message' && !message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (activeTab === 'file' && !fileContent) {
      toast.error('Please select a file');
      return;
    }

    setIsGenerating(true);

    try {
      let id;

      if (activeTab === 'message') {
        id = storageService.storeSecret(message, 'text', maxViews, expiryDays);
      } else {
        id = storageService.storeSecret(
          fileContent!,
          'file',
          maxViews,
          expiryDays,
          fileName,
          fileMimeType
        );
      }

      setSecretId(id);
      toast.success('Secret link generated successfully!');
    } catch (error) {
      console.error('Failed to create secret', error);
      toast.error('Failed to create secret');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSecretId(null);
    setMessage('');
    setFileContent(null);
    setFileName('');
    setFileMimeType('');
  };

  return (
    <div className="min-h-screen py-8 vault-container">
      <div className="container max-w-3xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">
            VanishVault
            <span className="ml-2 text-2xl">✉️💥</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Self-destructing secure messages and files
          </p>
        </header>

        {!secretId ? (
          <div className="space-y-8 animate-fade-in">
            <Tabs
              defaultValue="message"
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as 'message' | 'file')}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="message">Secure Message</TabsTrigger>
                <TabsTrigger value="file">Secure File</TabsTrigger>
              </TabsList>
              <div className="mt-6">
                <TabsContent value="message" className="mt-0">
                  <MessageInput onMessageChange={handleMessageChange} />
                </TabsContent>
                <TabsContent value="file" className="mt-0">
                  <FileUpload onFileSelect={handleFileSelect} />
                </TabsContent>
              </div>
            </Tabs>

            <ExpirationOptions
              expiryDays={expiryDays}
              setExpiryDays={setExpiryDays}
              maxViews={maxViews}
              setMaxViews={setMaxViews}
            />

            <div className="flex justify-center">
              <Button 
                onClick={handleCreateSecret}
                disabled={isGenerating}
                className="w-full max-w-xs"
                size="lg"
              >
                {isGenerating ? 'Generating...' : 'Generate Secret Link'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <GeneratedLink secretId={secretId} />
            
            <div className="flex justify-center mt-8">
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="w-full max-w-xs"
              >
                Create Another Secret
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
