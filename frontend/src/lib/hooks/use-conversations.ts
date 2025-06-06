import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationApi } from '../api';
import { useConversationStore } from '../stores';
import { 
  Conversation, 
  ConversationSummary,
  CreateConversationData, 
  UpdateConversationData, 
  ConversationFilters 
} from '@mochiport/shared';
import { useEffect } from 'react';
import { subscribeToConversation, subscribeToConversationList } from '../supabase/client';

// Utility function to convert Conversation to ConversationSummary
const convertToConversationSummary = (conversation: Conversation): ConversationSummary => ({
  id: conversation.id,
  title: conversation.title,
  status: conversation.status,
  messageCount: conversation.messages.length,
  lastMessage: conversation.messages.length > 0 ? {
    content: conversation.messages[conversation.messages.length - 1].content,
    role: conversation.messages[conversation.messages.length - 1].role,
    timestamp: conversation.messages[conversation.messages.length - 1].timestamp,
  } : undefined,
  createdAt: conversation.createdAt,
  updatedAt: conversation.updatedAt,
  metadata: conversation.metadata,
});

// Query keys
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (filters: ConversationFilters) => [...conversationKeys.lists(), filters] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
  stats: () => [...conversationKeys.all, 'stats'] as const,
};

// Hooks
export const useConversations = (filters?: ConversationFilters) => {
  const queryClient = useQueryClient();
  const store = useConversationStore();
  const userId = "current-user"; // TODO: 認証システムから実際のユーザーIDを取得する

  const query = useQuery({
    queryKey: conversationKeys.list(filters || {}),
    queryFn: () => conversationApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // リアルタイム購読の設定
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_ENABLE_REALTIME) return;

    // Supabaseリアルタイム購読を設定
    const subscription = subscribeToConversationList(userId, (payload) => {
      // 会話リストが変更された場合、キャッシュを無効化して再フェッチをトリガー
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      
      // ストアも更新
      if (payload.eventType === 'INSERT' && payload.new) {
        // 新しい会話が追加された場合
        store.actions.fetchConversations(filters);
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        // 会話が更新された場合
        store.actions.fetchConversations(filters);
      } else if (payload.eventType === 'DELETE' && payload.old) {
        // 会話が削除された場合
        store.actions.removeConversation(payload.old.id);
      }
    });

    // クリーンアップ時に購読を解除
    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, store.actions, filters, userId]);

  return query;
};

export const useConversation = (id: string, enabled = true) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: conversationKeys.detail(id),
    queryFn: () => conversationApi.getById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });

  // リアルタイム購読の設定
  useEffect(() => {
    if (!id || !enabled || !process.env.NEXT_PUBLIC_ENABLE_REALTIME) return;

    // Supabaseリアルタイム購読を設定
    const subscription = subscribeToConversation(id, (payload) => {
      // データ変更があった場合、キャッシュを更新
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        // クエリキャッシュを無効化して再フェッチをトリガー
        queryClient.invalidateQueries({ queryKey: conversationKeys.detail(id) });
      }
    });

    // クリーンアップ時に購読を解除
    return () => {
      subscription.unsubscribe();
    };
  }, [id, enabled, queryClient]);

  return query;
};

export const useConversationStats = () => {
  return useQuery({
    queryKey: conversationKeys.stats(),
    queryFn: () => conversationApi.getStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  const store = useConversationStore();

  return useMutation({
    mutationFn: (data: CreateConversationData) => conversationApi.create(data),
    onSuccess: (response) => {
      // Update cache
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: conversationKeys.stats() });
        // Update store
      store.actions.addConversation(convertToConversationSummary(response.data));
      store.actions.selectConversation(response.data.id);
    },
    onError: (error) => {
      store.actions.setError(error instanceof Error ? error.message : 'Unknown error');
    },
  });
};

export const useUpdateConversation = () => {
  const queryClient = useQueryClient();
  const store = useConversationStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateConversationData }) => 
      conversationApi.update(id, data),    onSuccess: (response, { id }) => {
      // Update cache
      queryClient.setQueryData(
        conversationKeys.detail(id),
        response
      );
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      
      // Update store
      store.actions.updateConversation(id, convertToConversationSummary(response.data));
    },
    onError: (error) => {
      store.actions.setError(error instanceof Error ? error.message : 'Unknown error');
    },
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  const store = useConversationStore();

  return useMutation({
    mutationFn: (id: string) => conversationApi.delete(id),
    onSuccess: (_, id) => {
      // Update cache
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: conversationKeys.stats() });
      queryClient.removeQueries({ queryKey: conversationKeys.detail(id) });
      
      // Update store
      store.actions.removeConversation(id);
    },
    onError: (error) => {
      store.actions.setError(error instanceof Error ? error.message : 'Unknown error');
    },
  });
};

export const useArchiveConversation = () => {
  const queryClient = useQueryClient();
  const store = useConversationStore();

  return useMutation({
    mutationFn: (id: string) => conversationApi.archive(id),
    onSuccess: (response, id) => {
      // Update cache
      queryClient.setQueryData(
        conversationKeys.detail(id),
        response
      );
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: conversationKeys.stats() });
      
      // Update store
      store.actions.updateConversation(id, convertToConversationSummary(response.data));
    },
    onError: (error) => {
      store.actions.setError(error instanceof Error ? error.message : 'Unknown error');
    },
  });
};

export const useRestoreConversation = () => {
  const queryClient = useQueryClient();
  const store = useConversationStore();

  return useMutation({
    mutationFn: (id: string) => conversationApi.restore(id),
    onSuccess: (response, id) => {
      // Update cache
      queryClient.setQueryData(
        conversationKeys.detail(id),
        response
      );      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: conversationKeys.stats() });
      
      // Update store
      store.actions.updateConversation(id, convertToConversationSummary(response.data));
    },
    onError: (error) => {
      store.actions.setError(error instanceof Error ? error.message : 'Unknown error');
    },
  });
};

export const useAddMessage = () => {
  const queryClient = useQueryClient();
  const store = useConversationStore();

  return useMutation({
    mutationFn: ({ 
      conversationId, 
      message 
    }: { 
      conversationId: string; 
      message: { content: string; role: 'user' | 'assistant' }; 
    }) => conversationApi.addMessage(conversationId, message),    onSuccess: (response, { conversationId }) => {
      // Update cache
      queryClient.setQueryData(
        conversationKeys.detail(conversationId),
        response
      );
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      
      // Update store
      store.actions.updateConversation(conversationId, convertToConversationSummary(response.data));
    },
    onError: (error) => {
      store.actions.setError(error instanceof Error ? error.message : 'Unknown error');
    },
  });
};
