'use client';

import { memo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Archive, 
  Trash2, 
  MoreHorizontal,
  Pin,
  Star,
  Clock,
  User,
  Bot
} from 'lucide-react';
import { Conversation } from '@ai-chat/shared';
import { cn } from '@/lib/utils';
import { formatDate } from '@ai-chat/shared';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface ConversationCardProps {
  conversation: Conversation;
  isSelected?: boolean;
  onSelect: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onPin?: (id: string) => void;
  onFavorite?: (id: string) => void;
  showActions?: boolean;
  className?: string;
}

export const ConversationCard = memo<ConversationCardProps>(({
  conversation,
  isSelected = false,
  onSelect,
  onArchive,
  onDelete,
  onPin,
  onFavorite,
  showActions = true,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const messageCount = conversation.messages.length;
  const isArchived = conversation.status === 'archived';  
  const metadata = conversation.metadata as any || {};
  const isPinned = metadata.pinned || false;
  const isFavorite = metadata.favorite || false;
  
  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md group',
        isSelected && 'ring-2 ring-primary shadow-md',
        isArchived && 'opacity-60',
        isPinned && 'border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20',
        className
      )}
      onClick={() => onSelect(conversation.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            {/* Conversation icon/avatar */}
            <div className="flex-shrink-0">
              {lastMessage?.role === 'assistant' ? (
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    <Bot className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {isPinned && (
                  <Pin className="h-3 w-3 text-yellow-600 flex-shrink-0" />
                )}
                <CardTitle className="text-sm font-medium line-clamp-1 flex-1">
                  {conversation.title}
                </CardTitle>
                {isFavorite && (
                  <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                )}
              </div>
              
              {/* Tags and priority */}
              {(conversation.metadata?.tags || conversation.metadata?.priority) && (
                <div className="flex items-center gap-1 mt-1">
                  {conversation.metadata.priority && (
                    <Badge 
                      variant={conversation.metadata.priority === 'high' ? 'destructive' : 'outline'}
                      className="text-xs h-4"
                    >
                      {conversation.metadata.priority === 'high' ? '高' : 
                       conversation.metadata.priority === 'medium' ? '中' : '低'}
                    </Badge>
                  )}
                  {conversation.metadata.tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs h-4">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {showActions && (isHovered || isSelected) && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onPin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPin(conversation.id);
                  }}
                  title={isPinned ? "ピン留めを解除" : "ピン留め"}
                >
                  <Pin className={cn("h-3 w-3", isPinned && "fill-current text-yellow-600")} />
                </Button>
              )}
              
              {onFavorite && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavorite(conversation.id);
                  }}
                  title={isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
                >
                  <Star className={cn("h-3 w-3", isFavorite && "fill-current text-yellow-500")} />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(conversation.id);
                }}
                title={isArchived ? "復元" : "アーカイブ"}
              >
                <Archive className="h-3 w-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conversation.id);
                }}
                title="削除"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
        <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Last message preview */}
          {lastMessage && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {lastMessage.role === 'user' ? (
                  <User className="h-3 w-3" />
                ) : (
                  <Bot className="h-3 w-3" />
                )}
                <span className="capitalize">{lastMessage.role === 'user' ? 'あなた' : 'AI'}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {lastMessage.content}
              </p>
            </div>
          )}
          
          {/* Stats and timestamp */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>{messageCount}</span>
              </div>
              
              {metadata.unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs h-4 px-1">
                  {metadata.unreadCount}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(conversation.updatedAt, { locale: ja, addSuffix: true })}</span>
            </div>
          </div>
          
          {/* Status indicators */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isArchived && (
                <Badge variant="secondary" className="text-xs">
                  アーカイブ済み
                </Badge>
              )}
              
              {metadata.category && (
                <Badge variant="outline" className="text-xs">
                  {metadata.category}
                </Badge>
              )}
            </div>
            
            {/* AI Model indicator */}
            {metadata.aiModel && (
              <Badge variant="outline" className="text-xs">
                {metadata.aiModel}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ConversationCard.displayName = 'ConversationCard';
