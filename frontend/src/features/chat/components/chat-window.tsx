'use client';

import { memo, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { Conversation, Message } from '@ai-chat/shared';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  conversation: Conversation | null;
  loading?: boolean;
  onSendMessage: (content: string) => void;
  onEditMessage?: (messageId: string) => void;
  onCopyMessage?: (content: string) => void;
  className?: string;
}

export const ChatWindow = memo<ChatWindowProps>(({
  conversation,
  loading = false,
  onSendMessage,
  onEditMessage,
  onCopyMessage,
  className
}) => {
  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // TODO: Show toast notification
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
    onCopyMessage?.(content);
  };

  if (!conversation) {
    return (
      <div className={cn(
        'flex flex-col h-full items-center justify-center text-center p-8',
        className
      )}>
        <div className="max-w-md space-y-4">
          <h3 className="text-lg font-semibold">会話を選択してください</h3>
          <p className="text-muted-foreground">
            左側のリストから会話を選択するか、新しい会話を開始してください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Chat header */}
      <div className="border-b p-4">
        <h2 className="font-semibold text-lg line-clamp-1">
          {conversation.title}
        </h2>
        <p className="text-sm text-muted-foreground">
          {conversation.messages.length} メッセージ
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {conversation.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onEdit={onEditMessage}
              onCopy={handleCopy}
            />
          ))}
          
          {loading && (
            <div className="flex justify-center p-4">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">AIが応答中...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInput
        onSendMessage={onSendMessage}
        loading={loading}
        disabled={conversation.status === 'archived'}
      />
    </div>
  );
});

ChatWindow.displayName = 'ChatWindow';
