'use client';

import { memo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Message } from '@mochiport/shared';
import { cn } from '@/lib/utils';
import { formatDate } from '@mochiport/shared';
import { 
  User, 
  Bot, 
  Copy, 
  Edit, 
  MoreHorizontal, 
  Heart,
  MessageCircle,
  Share,
  Trash2,
  Check
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';

interface MessageBubbleProps {
  message: Message;
  onEdit?: (messageId: string) => void;
  onCopy?: (content: string) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, reaction: string) => void;
  onShare?: (messageId: string) => void;
  isEditing?: boolean;
  showTimestamp?: boolean;
  showActions?: boolean;
  className?: string;
}

export const MessageBubble = memo<MessageBubbleProps>(({
  message,
  onEdit,
  onCopy,
  onDelete,
  onReact,
  onShare,
  isEditing = false,
  showTimestamp = true,
  showActions = true,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      onCopy?.(message.content);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };
  if (isSystem) {
    return (
      <div className={cn('flex justify-center my-4', className)}>
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-muted text-muted-foreground border">
          <MessageCircle className="h-3 w-3 mr-1" />
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'group flex gap-3 p-4 hover:bg-muted/30 transition-colors',
        isUser && 'flex-row-reverse',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className={cn(
          "text-xs font-medium",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </AvatarFallback>
      </Avatar>

      <div className={cn(
        'flex flex-col space-y-1 max-w-[80%] min-w-0',
        isUser && 'items-end'
      )}>
        {/* Message content */}
        <Card className={cn(
          'shadow-sm border transition-all duration-200',
          isUser 
            ? 'bg-primary text-primary-foreground border-primary/20' 
            : 'bg-background border-border',
          isEditing && 'ring-2 ring-primary/50',
          isHovered && 'shadow-md'
        )}>
          <CardContent className="p-3">
            <div className="text-sm whitespace-pre-wrap leading-relaxed">
              {message.content}
            </div>
          </CardContent>
        </Card>

        {/* Timestamp and actions */}
        <div className={cn(
          'flex items-center gap-2 transition-opacity',
          isUser && 'flex-row-reverse',
          showTimestamp || showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        )}>
          {showTimestamp && (
            <span className="text-xs text-muted-foreground">
              {formatDate(message.timestamp)}
            </span>
          )}

          {showActions && (isHovered || isEditing) && (
            <div className="flex items-center gap-1">
              {/* Copy button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCopy}
                title="コピー"
              >
                {copySuccess ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>

              {/* React button */}
              {onReact && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onReact(message.id, '👍')}
                  title="リアクション"
                >
                  <Heart className="h-3 w-3" />
                </Button>
              )}

              {/* More actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    title="その他のアクション"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isUser ? "end" : "start"} className="w-48">
                  {onEdit && isUser && (
                    <DropdownMenuItem onClick={() => onEdit(message.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      編集
                    </DropdownMenuItem>
                  )}
                  {onShare && (
                    <DropdownMenuItem onClick={() => onShare(message.id)}>
                      <Share className="h-4 w-4 mr-2" />
                      共有
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(message.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      削除
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Message metadata */}
        {message.metadata && (
          <div className={cn(
            'flex items-center gap-2 mt-1',
            isUser && 'flex-row-reverse'
          )}>
            {message.metadata.confidence && (
              <Badge variant="secondary" className="text-xs">
                信頼度: {Math.round(message.metadata.confidence * 100)}%
              </Badge>
            )}
            {message.metadata.tokens && (
              <Badge variant="outline" className="text-xs">
                {message.metadata.tokens} トークン
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';
