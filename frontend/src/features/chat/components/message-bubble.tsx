'use client';

import { memo } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Message } from '@ai-chat/shared';
import { cn } from '@/lib/utils';
import { formatDate } from '@ai-chat/shared/utils';
import { User, Bot, Copy, Edit } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  onEdit?: (messageId: string) => void;
  onCopy?: (content: string) => void;
  className?: string;
}

export const MessageBubble = memo<MessageBubbleProps>(({
  message,
  onEdit,
  onCopy,
  className
}) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className={cn('flex justify-center my-4', className)}>
        <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'flex gap-3 p-4',
      isUser && 'flex-row-reverse',
      className
    )}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback>
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </AvatarFallback>
      </Avatar>

      <div className={cn(
        'flex flex-col space-y-2 max-w-[80%]',
        isUser && 'items-end'
      )}>
        <Card className={cn(
          'shadow-sm',
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted'
        )}>
          <CardContent className="p-3">
            <div className="text-sm whitespace-pre-wrap">
              {message.content}
            </div>
          </CardContent>
        </Card>

        <div className={cn(
          'flex items-center gap-2',
          isUser && 'flex-row-reverse'
        )}>
          <span className="text-xs text-muted-foreground">
            {formatDate(message.timestamp)}
          </span>

          <div className="flex items-center gap-1">
            {onCopy && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onCopy(message.content)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            )}

            {onEdit && isUser && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onEdit(message.id)}
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';
