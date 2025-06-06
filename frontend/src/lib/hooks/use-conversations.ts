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
  return useQuery({
    queryKey: conversationKeys.list(filters || {}),
    queryFn: () => conversationApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useConversation = (id: string, enabled = true) => {
  return useQuery({
    queryKey: conversationKeys.detail(id),
    queryFn: () => conversationApi.getById(id),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
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
