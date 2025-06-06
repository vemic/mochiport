'use client';

import { memo, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Loader2, 
  Paperclip, 
  Smile,
  AtSign,
  Hash,
  Mic,
  Square
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  loading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
  showFormatting?: boolean;
  onFileAttach?: (file: File) => void;
  onVoiceRecord?: () => void;
  className?: string;
}

export const ChatInput = memo<ChatInputProps>(({
  onSendMessage,
  loading = false,
  placeholder = 'メッセージを入力...',
  disabled = false,
  maxLength = 4000,
  showCharCount = true,
  showFormatting = false,
  onFileAttach,
  onVoiceRecord,
  className
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = message.length;
  const isOverLimit = charCount > maxLength;

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !loading && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  const handleFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onFileAttach) {
      onFileAttach(files[0]);
      // Clear the input
      e.target.value = '';
    }
  };

  const handleVoiceRecord = () => {
    if (onVoiceRecord) {
      setIsRecording(!isRecording);
      onVoiceRecord();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  return (
    <div className="flex flex-col gap-1 bg-background">
      {/* Formatting toolbar (optional) */}
      {showFormatting && (
        <div className="flex items-center gap-1 px-4 py-1 border-t">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <Hash className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <AtSign className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <Smile className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Main input area */}
      <div className={cn('flex items-end gap-2 p-4', className)}>
        {/* Hidden file input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden"
          accept="image/*, application/pdf, text/*" 
          title="ファイル添付"
          aria-label="ファイル添付"
        />
        
        {/* Voice recording button */}
        {onVoiceRecord && (
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="icon"
            className="h-10 w-10 flex-shrink-0 rounded-full"
            onClick={handleVoiceRecord}
            disabled={disabled}
            title={isRecording ? "録音停止" : "音声録音"}
          >
            {isRecording ? (
              <Square className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Text input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || loading || isRecording}
            className={cn(
              "min-h-[44px] max-h-[120px] resize-none pr-12 transition-colors",
              isOverLimit && "border-red-500 focus-visible:ring-red-500"
            )}
            rows={1}
            maxLength={maxLength > 0 ? maxLength : undefined}
          />
          
          {/* Attachment button */}
          {onFileAttach && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 bottom-2 h-8 w-8"
              onClick={handleFileInput}
              disabled={disabled || loading || isRecording}
              title="ファイル添付"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          )}
          
          {/* Character count */}
          {showCharCount && maxLength > 0 && (
            <div className={cn(
              "absolute right-3 -bottom-5 text-xs",
              isOverLimit ? "text-red-500" : "text-muted-foreground"
            )}>
              {charCount}/{maxLength}
            </div>
          )}
        </div>

        {/* Send button */}
        <Button
          onClick={handleSubmit}
          disabled={!message.trim() || loading || disabled || isRecording || isOverLimit}
          size="icon"
          className="h-10 w-10 flex-shrink-0 rounded-full"
          title="送信"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';
