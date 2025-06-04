'use client';

import { useState, useEffect } from 'react';
import { ConversationCard } from '../components/conversation-card';
import { ChatWindow } from '../components/chat-window';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  useConversations, 
  useCreateConversation, 
  useUpdateConversation,
  useDeleteConversation,
  useArchiveConversation,
  useAddMessage
} from '@/lib/hooks';
import { useConversationStore } from '@/lib/stores';
import { useDebounce } from '@/lib/hooks';
import { Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatContainerProps {
  className?: string;
}

export function ChatContainer({ className }: ChatContainerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  const store = useConversationStore();
  const { selectedConversation, selectedConversationId } = store;

  // API hooks
  const { data: conversationsData, isLoading } = useConversations({
    search: debouncedSearch || undefined,
    status: 'active'
  });

  const createMutation = useCreateConversation();
  const updateMutation = useUpdateConversation();
  const deleteMutation = useDeleteConversation();
  const archiveMutation = useArchiveConversation();
  const addMessageMutation = useAddMessage();

  // Update store when data changes
  useEffect(() => {
    if (conversationsData?.data) {
      store.actions.setConversations(conversationsData.data);
    }
  }, [conversationsData, store.actions]);
  const handleCreateConversation = async () => {
    try {
      await createMutation.mutateAsync({
        title: '新しい会話'
      });
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleSelectConversation = (id: string) => {
    store.actions.selectConversation(id);
  };

  const handleArchiveConversation = async (id: string) => {
    try {
      await archiveMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to archive conversation:', error);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    if (window.confirm('この会話を削除しますか？この操作は取り消せません。')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete conversation:', error);
      }
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId) return;

    try {
      await addMessageMutation.mutateAsync({
        conversationId: selectedConversationId,
        message: {
          content,
          role: 'user'
        }
      });

      // Simulate AI response (replace with actual AI integration)
      setTimeout(async () => {
        await addMessageMutation.mutateAsync({
          conversationId: selectedConversationId,
          message: {
            content: 'これは模擬的なAI応答です。実際の実装では、ここでAI APIを呼び出します。',
            role: 'assistant'
          }
        });
      }, 1000);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const conversations = store.conversations;

  return (
    <div className={cn('flex h-full', className)}>
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold">会話</h1>
            <Button
              size="icon"
              onClick={handleCreateConversation}
              disabled={createMutation.isPending}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="会話を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">会話がありません</p>
                <Button
                  variant="link"
                  onClick={handleCreateConversation}
                  className="mt-2"
                >
                  新しい会話を開始
                </Button>
              </div>
            ) : (
              conversations.map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  isSelected={conversation.id === selectedConversationId}
                  onSelect={handleSelectConversation}
                  onArchive={handleArchiveConversation}
                  onDelete={handleDeleteConversation}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1">
        <ChatWindow
          conversation={selectedConversation}
          loading={addMessageMutation.isPending}
          onSendMessage={handleSendMessage}
          onCopyMessage={(content) => {
            // TODO: Show toast notification
            console.log('Copied:', content);
          }}
        />
      </div>
    </div>
  );
}
