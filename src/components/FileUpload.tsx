
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Eye } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (fileContent: string, fileName: string, mimeType: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Simulate upload progress
      setUploading(true);
      setUploadProgress(0);
      
      const reader = new FileReader();
      
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };
      
      reader.onload = (event) => {
        setTimeout(() => {
          setUploading(false);
          
          if (event.target?.result && typeof event.target.result === 'string') {
            onFileSelect(
              event.target.result,
              selectedFile.name,
              selectedFile.type || 'application/octet-stream'
            );
          }
        }, 500); // Small delay to show 100% progress
      };
      
      reader.readAsDataURL(selectedFile);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="shadow-lg border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all">
      <CardContent className="p-6">
        <div 
          className="flex flex-col items-center justify-center gap-4 cursor-pointer py-8"
          onClick={triggerFileSelect}
        >
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Eye className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold">Upload File</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {file ? file.name : "Click to select a file"}
            </p>
          </div>
          <Input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          
          {!file && (
            <Button variant="outline" className="mt-2">
              Select File
            </Button>
          )}

          {uploading && (
            <div className="w-full mt-4">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-center mt-2 text-muted-foreground">
                Processing {uploadProgress}%
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
