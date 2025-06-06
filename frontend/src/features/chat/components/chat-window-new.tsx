'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { Conversation } from '@mochiport/shared';
import { cn } from '@/lib/utils';
import { formatDate } from '@mochiport/shared';
import { subscribeToConversation } from '@/lib/supabase/client';
import { 
  MoreVertical, 
  Archive, 
  Download,
  Settings,
  Search,
  Pin,
  Star,
  MessageCircle,
  ChevronDown,
  RefreshCw
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pendingMessages, setPendingMessages] = useState<any[]>([]);
  const [rtStatus, setRtStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // イベントハンドラ
  const handlePin = () => conversation?.id && onPinConversation?.(conversation.id);
  const handleFavorite = () => conversation?.id && onFavoriteConversation?.(conversation.id);
  const handleExport = () => conversation?.id && onExportConversation?.(conversation.id);
  const handleArchive = () => conversation?.id && onArchiveConversation?.(conversation.id);
  const handleCopy = (content: string) => onCopyMessage?.(content);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // メッセージが追加されたら自動スクロール
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages?.length, pendingMessages.length]);
  
  // リアルタイム接続を設定
  useEffect(() => {
    // 会話がない、またはリアルタイム機能が無効の場合は何もしない
    if (!conversation?.id || process.env.NEXT_PUBLIC_ENABLE_REALTIME !== 'true') return;
    
    setRtStatus('connecting');
    
    try {
      // Supabaseリアルタイム購読を設定
      const subscription = subscribeToConversation(conversation.id, (payload) => {
        setRtStatus('connected');
        
        // 新しいメッセージが追加された場合
        if (payload.eventType === 'INSERT' && payload.new) {
          // 保留中のメッセージに追加（APIフェッチの前に素早く表示するため）
          setPendingMessages((prev) => [...prev, payload.new]);
        }
      });
      
      // クリーンアップ時に購読を解除
      return () => {
        if (subscription) {
          subscription.unsubscribe();
          setRtStatus('disconnected');
        }
      };
    } catch (error) {
      console.error('リアルタイム接続エラー:', error);
      setRtStatus('disconnected');
    }
  }, [conversation?.id]);
  
  // 保留中のメッセージをクリア（APIの完全なデータが取得できたとき）
  useEffect(() => {
    if (conversation?.messages?.length) {
      setPendingMessages([]);
    }
  }, [conversation?.messages]);

  // ステータスが存在しない場合は空の画面を表示
  if (!conversation) {
    return (
      <div className={cn("flex flex-col h-full items-center justify-center bg-muted/10", className)}>
        <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-2" />
        <h2 className="text-xl font-medium text-muted-foreground/70">会話を選択してください</h2>
        <p className="text-sm text-muted-foreground/50">または新しい会話を開始します</p>
      </div>
    );
  }

  const messageCount = conversation.messages.length;
  const lastActivity = conversation.updatedAt;
  const isArchived = conversation.status === 'archived';
  const metadata = conversation.metadata as any || {};
  const isPinned = metadata.pinned || false;
  const isFavorite = metadata.favorite || false;
  
  // すべてのメッセージ (APIから取得 + リアルタイムの保留中メッセージ)
  const allMessages = [...conversation.messages, ...pendingMessages];
  
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
                {/* リアルタイム接続状態表示 */}
                {rtStatus === 'connected' && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    リアルタイム
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
            {/* 通常のメッセージ + リアルタイム更新メッセージ */}
            {allMessages.map((message, index) => (
              <MessageBubble
                key={message.id || `pending-${index}`}
                message={message}
                onEdit={message.id ? onEditMessage : undefined}
                onCopy={handleCopy}
                onDelete={message.id ? onDeleteMessage : undefined}
                onReact={message.id ? onReactToMessage : undefined}
                onShare={message.id ? onShareMessage : undefined}
                showTimestamp={true}
                showActions={!!message.id}
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
            
            <div ref={messagesEndRef} />
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
        
        {rtStatus === 'connecting' && (
          <div className="px-4 pb-2">
            <div className="text-xs text-yellow-600 text-center flex items-center justify-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              リアルタイム接続を確立中...
            </div>
          </div>
        )}
        
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
