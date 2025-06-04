'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Archive, Trash2, MoreHorizontal } from 'lucide-react';
import { Conversation } from '@ai-chat/shared';
import { cn } from '@/lib/utils';
import { formatDate } from '@ai-chat/shared';

interface ConversationCardProps {
  conversation: Conversation;
  isSelected?: boolean;
  onSelect: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export const ConversationCard = memo<ConversationCardProps>(({
  conversation,
  isSelected = false,
  onSelect,
  onArchive,
  onDelete,
  className
}) => {
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const messageCount = conversation.messages.length;

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-primary',
        conversation.status === 'archived' && 'opacity-60',
        className
      )}
      onClick={() => onSelect(conversation.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium line-clamp-1">
              {conversation.title}
            </CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onArchive(conversation.id);
              }}
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
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          {lastMessage && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {lastMessage.content}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{messageCount} メッセージ</span>
            <span>{formatDate(conversation.updatedAt)}</span>
          </div>
          
          {conversation.status === 'archived' && (
            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
              アーカイブ済み
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

ConversationCard.displayName = 'ConversationCard';
