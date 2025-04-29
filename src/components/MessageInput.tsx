
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  onMessageChange: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onMessageChange }) => {
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    onMessageChange(newMessage);
  };

  return (
    <Card className="shadow-md">
      <CardContent className="p-4">
        <Textarea
          placeholder="Type your secure message here..."
          className="min-h-[120px] resize-none"
          value={message}
          onChange={handleChange}
        />
        <p className="text-xs text-muted-foreground mt-2">
          {message.length} characters
        </p>
      </CardContent>
    </Card>
  );
};

export default MessageInput;
