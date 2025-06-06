'use client';

import { useState, useEffect } from 'react';
import { ConversationCard } from '../components/conversation-card';
import { ChatWindow } from '../components/chat-window';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useConversations,
  useConversation,
  useCreateConversation,
  useUpdateConversation,
  useDeleteConversation,
  useArchiveConversation,
  useAddMessage
} from '@/lib/hooks';
import { useConversationStore } from '@/lib/stores';
import { useDebounce } from '@/lib/hooks';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  Archive as ArchiveIcon,
  Pin
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatContainerProps {
  className?: string;
}

export function ChatContainer({ className }: ChatContainerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [rtEnabled, setRtEnabled] = useState(process.env.NEXT_PUBLIC_ENABLE_REALTIME === 'true');
  const [showPinned, setShowPinned] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const store = useConversationStore();
  const { selectedConversationId } = store;
  // API hooks
  const { data: conversationsData, isLoading } = useConversations({
    search: debouncedSearch || undefined,
    status: 'active'
  });

  // 選択された会話の詳細を取得
  const { data: selectedConversationData } = useConversation(
    selectedConversationId || '',
    !!selectedConversationId
  );

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
      // TODO: Show error notification to user
      // console.error('Failed to create conversation:', error);
    }
  };

  const handleSelectConversation = (id: string) => {
    store.actions.selectConversation(id);
  };
  const handleArchiveConversation = async (id: string) => {
    try {
      await archiveMutation.mutateAsync(id);
    } catch (error) {
      // TODO: Show error notification to user
      // console.error('Failed to archive conversation:', error);
    }
  };
  const handleDeleteConversation = async (id: string) => {
    if (window.confirm('この会話を削除しますか？この操作は取り消せません。')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        // TODO: Show error notification to user
        // console.error('Failed to delete conversation:', error);
      }
    }
  };

  // ピン留め機能の実装
  const handlePinConversation = async (id: string) => {
    const conversation = store.conversations.find(c => c.id === id);
    if (!conversation) return;

    const metadata = conversation.metadata as any || {};
    const isPinned = metadata.pinned || false;

    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          metadata: {
            ...metadata,
            pinned: !isPinned
          } as any
        }
      });

      // TODO: Show success notification to user
      // console.log(`会話を${!isPinned ? 'ピン留め' : 'ピン留め解除'}しました`);
    } catch (error) {
      // TODO: Show error notification to user
      // console.error('Failed to update pin status:', error);
    }
  };

  // お気に入り機能の実装
  const handleFavoriteConversation = async (id: string) => {
    const conversation = store.conversations.find(c => c.id === id);
    if (!conversation) return;

    const metadata = conversation.metadata as any || {};
    const isFavorite = metadata.favorite || false;

    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          metadata: {
            ...metadata,
            favorite: !isFavorite
          } as any
        }
      });

      // TODO: Show success notification to user
      // console.log(`会話を${!isFavorite ? 'お気に入りに追加' : 'お気に入りから削除'}しました`);
    } catch (error) {
      // TODO: Show error notification to user
      // console.error('Failed to update favorite status:', error);
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
      // TODO: Show error notification to user
      // console.error('Failed to send message:', error);
    }
  };
  const handleExportConversation = (id: string) => {
    // TODO: Implement conversation export
    // console.log('Export conversation:', id);
  };
  const handleDeleteMessage = async (messageId: string) => {
    // TODO: Implement message deletion
    // console.log('Delete message:', messageId);
  };

  // チャットウィンドウでのピン留め・お気に入り処理
  const handleChatWindowPin = async () => {
    if (selectedConversationId) {
      await handlePinConversation(selectedConversationId);
    }
  };

  const handleChatWindowFavorite = async () => {
    if (selectedConversationId) {
      await handleFavoriteConversation(selectedConversationId);
    }
  };

  // 高度なフィルタリング機能
  const toggleFiltersVisibility = () => {
    setIsFiltersVisible(!isFiltersVisible);
  };

  const handleTagFilter = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSelectedCategory('');
    setSelectedPriority('');
    setShowFavorites(false);
    setShowPinned(false);
    setFilter('all');
  };

  // Process conversations based on filters
  let conversations = store.conversations;

  // Filter by status
  if (filter === 'archived') {
    conversations = conversations.filter(c => c.status === 'archived');
  } else {
    conversations = conversations.filter(c => c.status === 'active');
  }

  // Filter by favorites
  if (showFavorites) {
    conversations = conversations.filter(c => (c.metadata as any)?.favorite);
  }

  // Filter by pinned
  if (showPinned) {
    conversations = conversations.filter(c => (c.metadata as any)?.pinned);
  }

  // Filter by tags
  if (selectedTags.length > 0) {
    conversations = conversations.filter(c =>
      selectedTags.every(tag => c.metadata?.tags?.includes(tag))
    );
  }

  // Filter by category
  if (selectedCategory) {
    conversations = conversations.filter(c => c.metadata?.category === selectedCategory);
  }

  // Filter by priority
  if (selectedPriority) {
    conversations = conversations.filter(c => c.metadata?.priority === selectedPriority);
  }

  // Sort: pinned first, then by updated date
  conversations = [...conversations].sort((a, b) => {
    const isPinnedA = (a.metadata as any)?.pinned || false;
    const isPinnedB = (b.metadata as any)?.pinned || false;

    if (isPinnedA && !isPinnedB) return -1;
    if (!isPinnedA && isPinnedB) return 1;

    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  // Extract unique tags and categories for filters
  const allTags = Array.from(new Set(
    store.conversations
      .flatMap(c => c.metadata?.tags || [])
      .filter(Boolean)
  ));

  const allCategories = Array.from(new Set(
    store.conversations
      .map(c => c.metadata?.category)
      .filter(Boolean)
  )) as string[];

  return (
    <div className={cn('flex h-full', className)}>
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold">会話</h1>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={toggleFiltersVisibility}
                title="フィルター"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                className="h-8 w-8"
                onClick={handleCreateConversation}
                disabled={createMutation.isPending}
                title="新しい会話"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
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

          {/* Simple filter buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="flex-1 text-xs"
            >
              全て
            </Button>
            <Button
              variant={filter === 'archived' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('archived')}
              className="flex-1 text-xs"
            >
              <ArchiveIcon className="h-3 w-3 mr-1" />
              アーカイブ
            </Button>
          </div>

          {/* Advanced filters */}
          {isFiltersVisible && (
            <div className="space-y-3 py-2 border-t border-b">
              {/* Favorite & Pinned filters */}
              <div className="flex items-center gap-2">
                <Button
                  variant={showFavorites ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowFavorites(!showFavorites)}
                  className="text-xs gap-1 h-7"
                >
                  <Star className={cn("h-3 w-3", showFavorites && "fill-current")} />
                  お気に入り
                </Button>
                <Button
                  variant={showPinned ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowPinned(!showPinned)}
                  className="text-xs gap-1 h-7"
                >
                  <Pin className={cn("h-3 w-3", showPinned && "fill-current")} />
                  ピン留め
                </Button>
              </div>

              {/* Tags filter */}
              {allTags.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs font-medium">タグ</Label>
                  <div className="flex flex-wrap gap-1">
                    {allTags.map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                        className="text-xs cursor-pointer hover:opacity-80"
                        onClick={() => handleTagFilter(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories filter */}
              {allCategories.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs font-medium">カテゴリ</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="カテゴリを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">すべて</SelectItem>
                      {allCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Priority filter */}
              <div className="space-y-1">
                <Label className="text-xs font-medium">優先度</Label>
                <Select
                  value={selectedPriority}
                  onValueChange={setSelectedPriority}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="優先度を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">すべて</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear filters */}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs w-full"
              >
                フィルターをクリア
              </Button>
            </div>
          )}
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
                  onPin={handlePinConversation}
                  onFavorite={handleFavoriteConversation}
                  showActions={true}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1">        <ChatWindow
        conversation={selectedConversationData?.data || null}
        loading={addMessageMutation.isPending}
        onSendMessage={handleSendMessage} onEditMessage={(messageId) => {
          // TODO: Implement message editing
          // console.log('Edit message:', messageId);
        }}
        onDeleteMessage={handleDeleteMessage}
        onCopyMessage={(content) => {
          // TODO: Show toast notification
          // console.log('Copied:', content);
        }}
        onArchiveConversation={handleArchiveConversation}
        onExportConversation={handleExportConversation}
        onReactToMessage={(messageId, reaction) => {
          // TODO: Implement message reactions
          // console.log('React to message:', messageId, reaction);
        }}
        onShareMessage={(messageId) => {
          // TODO: Implement message sharing
          // console.log('Share message:', messageId);
        }}
        onPinConversation={handleChatWindowPin}
        onFavoriteConversation={handleChatWindowFavorite}
      />
      </div>
    </div>
  );
}
