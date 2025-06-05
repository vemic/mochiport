'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { Conversation, Message } from '@mochiport/shared';
import { cn } from '@/lib/utils';
import { formatDate } from '@mochiport/shared';
import { 
  MoreVertical, 
  Archive, 
  Download,
  Settings,
  Search,
  Pin,
  Star,
  MessageCircle,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';

interface ChatWindowProps {
  conversation: Conversation | null;
  loading?: boolean;
  onSendMessage: (content: string) => void;
  onEditMessage?: (messageId: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onCopyMessage?: (content: string) => void;
  onArchiveConversation?: (conversationId: string) => void;
  onExportConversation?: (conversationId: string) => void;
  onReactToMessage?: (messageId: string, reaction: string) => void;
  onShareMessage?: (messageId: string) => void;
  onPinConversation?: (conversationId: string) => void;
  onFavoriteConversation?: (conversationId: string) => void;
  className?: string;
}

export const ChatWindow = memo<ChatWindowProps>(({
  conversation,
  loading = false,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onCopyMessage,
  onArchiveConversation,
  onExportConversation,
  onReactToMessage,
  onShareMessage,
  onPinConversation,
  onFavoriteConversation,
  className
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = (viewport: HTMLDivElement) => {
    const { scrollTop, scrollHeight, clientHeight } = viewport;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    setIsAtBottom(isAtBottom);
    setShowScrollButton(!isAtBottom && scrollHeight > clientHeight);
  };  
  
  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // TODO: Show toast notification
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
    onCopyMessage?.(content);
  };

  const handleExport = () => {
    if (conversation) {
      onExportConversation?.(conversation.id);
    }
  };

  const handleArchive = () => {
    if (conversation) {
      onArchiveConversation?.(conversation.id);
    }
  };

  const handlePin = () => {
    if (conversation && onPinConversation) {
      onPinConversation(conversation.id);
    }
  };

  const handleFavorite = () => {
    if (conversation && onFavoriteConversation) {
      onFavoriteConversation(conversation.id);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isAtBottom && conversation?.messages) {
      scrollToBottom();
    }
  }, [conversation?.messages, isAtBottom]);
  
  if (!conversation) {
    return (
      <div className={cn(
        'flex flex-col h-full items-center justify-center text-center p-8 bg-muted/20',
        className
      )}>
        <div className="max-w-md space-y-6">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto">
            <MessageCircle className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">会話を選択してください</h3>
            <p className="text-muted-foreground">
              左側のリストから会話を選択するか、新しい会話を開始してください。
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full">
              <Search className="h-4 w-4 mr-2" />
              会話を検索
            </Button>
            <Button variant="default" className="w-full">
              新しい会話を開始
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const messageCount = conversation.messages.length;
  const lastActivity = conversation.updatedAt;
  const isArchived = conversation.status === 'archived';
  const metadata = conversation.metadata as any || {};
  const isPinned = metadata.pinned || false;
  const isFavorite = metadata.favorite || false;
  
  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Enhanced Chat header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-lg line-clamp-1 flex-1">
                  {conversation.title}
                </h2>
                {isArchived && (
                  <Badge variant="secondary" className="text-xs">
                    アーカイブ
                  </Badge>
                )}
                {conversation.metadata?.priority && (
                  <Badge 
                    variant={conversation.metadata.priority === 'high' ? 'destructive' : 'outline'}
                    className="text-xs"
                  >
                    {conversation.metadata.priority === 'high' ? '高' : 
                     conversation.metadata.priority === 'medium' ? '中' : '低'}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm text-muted-foreground">
                  {messageCount} メッセージ
                </p>
                <p className="text-sm text-muted-foreground">
                  最終更新: {formatDate(lastActivity)}
                </p>
                {conversation.metadata?.tags && conversation.metadata.tags.length > 0 && (
                  <div className="flex gap-1">
                    {conversation.metadata.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {conversation.metadata.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{conversation.metadata.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" title="検索">
              <Search className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              title={isPinned ? "ピン留め解除" : "ピン留め"}
              onClick={handlePin}
              className={isPinned ? "text-yellow-600" : ""}
            >
              <Pin className={cn("h-4 w-4", isPinned && "fill-current")} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              title={isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
              onClick={handleFavorite}
              className={isFavorite ? "text-yellow-500" : ""}
            >
              <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  エクスポート
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  {isArchived ? '復元' : 'アーカイブ'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  会話設定
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Messages with enhanced scroll */}
      <div className="flex-1 relative">
        <ScrollArea className="h-full">
          <div className="space-y-0">
            {conversation.messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                onEdit={onEditMessage}
                onCopy={handleCopy}
                onDelete={onDeleteMessage}
                onReact={onReactToMessage}
                onShare={onShareMessage}
                showTimestamp={true}
                showActions={true}
              />
            ))}
            
            {loading && (
              <div className="flex justify-center p-6">
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-sm font-medium">AIが応答中...</span>
                </div>
              </div>
            )}
            
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute bottom-4 right-4 rounded-full shadow-lg z-10"
            onClick={scrollToBottom}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        )}

        {/* Message count indicator */}
        {messageCount > 10 && (
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="secondary" className="text-xs">
              {messageCount} メッセージ
            </Badge>
          </div>
        )}
      </div>
      
      {/* Enhanced Input */}
      <div className="border-t bg-card">
        <ChatInput
          onSendMessage={onSendMessage}
          loading={loading}
          disabled={isArchived}
          placeholder={isArchived ? "この会話はアーカイブされています" : "メッセージを入力..."}
          className="border-0"
        />
        
        {isArchived && (
          <div className="px-4 pb-2">
            <div className="text-xs text-muted-foreground text-center">
              アーカイブされた会話です。メッセージを送信するには復元してください。
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ChatWindow.displayName = 'ChatWindow';
