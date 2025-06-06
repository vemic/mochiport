import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { draftApi } from '../api';
import { useDraftStore } from '../stores';
import { 
  CreateDraftData, 
  UpdateDraftData, 
  DraftFilters 
} from '@mochiport/shared';

// Query keys
export const draftKeys = {
  all: ['drafts'] as const,
  lists: () => [...draftKeys.all, 'list'] as const,
  list: (filters: DraftFilters) => [...draftKeys.lists(), filters] as const,
  details: () => [...draftKeys.all, 'detail'] as const,
  detail: (id: string) => [...draftKeys.details(), id] as const,
  recent: () => [...draftKeys.all, 'recent'] as const,
  search: (query: string) => [...draftKeys.all, 'search', query] as const,
  stats: () => [...draftKeys.all, 'stats'] as const,
};

// Hooks
export const useDrafts = (filters?: DraftFilters) => {
  return useQuery({
    queryKey: draftKeys.list(filters || {}),
    queryFn: () => draftApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDraft = (id: string, enabled = true) => {
  return useQuery({
    queryKey: draftKeys.detail(id),
    queryFn: () => draftApi.getById(id),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useRecentDrafts = (limit = 10) => {
  return useQuery({
    queryKey: [...draftKeys.recent(), limit],
    queryFn: () => draftApi.getRecent(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSearchDrafts = (query: string, enabled = true) => {
  return useQuery({
    queryKey: draftKeys.search(query),
    queryFn: () => draftApi.search(query),
    enabled: enabled && query.length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useDraftStats = () => {
  return useQuery({
    queryKey: draftKeys.stats(),
    queryFn: () => draftApi.getStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateDraft = () => {
  const queryClient = useQueryClient();
  const store = useDraftStore();

  return useMutation({
    mutationFn: (data: CreateDraftData) => draftApi.create(data),
    onSuccess: (response) => {
      // Update cache
      queryClient.invalidateQueries({ queryKey: draftKeys.lists() });
      queryClient.invalidateQueries({ queryKey: draftKeys.recent() });
      queryClient.invalidateQueries({ queryKey: draftKeys.stats() });
      
      // Update store
      store.actions.addDraft(response.data);
      store.actions.selectDraft(response.data.id);
    },
    onError: (error) => {
      store.actions.setError(error instanceof Error ? error.message : 'Unknown error');
    },
  });
};

export const useUpdateDraft = () => {
  const queryClient = useQueryClient();
  const store = useDraftStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDraftData }) => 
      draftApi.update(id, data),
    onSuccess: (response, { id }) => {
      // Update cache
      queryClient.setQueryData(
        draftKeys.detail(id),
        response
      );
      queryClient.invalidateQueries({ queryKey: draftKeys.lists() });
      queryClient.invalidateQueries({ queryKey: draftKeys.recent() });
      
      // Update store
      store.actions.updateDraft(id, response.data);
    },
    onError: (error) => {
      store.actions.setError(error instanceof Error ? error.message : 'Unknown error');
    },
  });
};

export const useDeleteDraft = () => {
  const queryClient = useQueryClient();
  const store = useDraftStore();

  return useMutation({
    mutationFn: (id: string) => draftApi.delete(id),
    onSuccess: (_, id) => {
      // Update cache
      queryClient.invalidateQueries({ queryKey: draftKeys.lists() });
      queryClient.invalidateQueries({ queryKey: draftKeys.recent() });
      queryClient.invalidateQueries({ queryKey: draftKeys.stats() });
      queryClient.removeQueries({ queryKey: draftKeys.detail(id) });
      
      // Update store
      store.actions.removeDraft(id);
    },
    onError: (error) => {
      store.actions.setError(error instanceof Error ? error.message : 'Unknown error');
    },
  });
};

export const usePublishDraft = () => {
  const queryClient = useQueryClient();
  const store = useDraftStore();

  return useMutation({
    mutationFn: (id: string) => draftApi.publish(id),
    onSuccess: (response, id) => {
      // Update cache
      queryClient.setQueryData(
        draftKeys.detail(id),
        response
      );
      queryClient.invalidateQueries({ queryKey: draftKeys.lists() });
      queryClient.invalidateQueries({ queryKey: draftKeys.stats() });
      
      // Update store
      store.actions.updateDraft(id, response.data);
    },
    onError: (error) => {
      store.actions.setError(error instanceof Error ? error.message : 'Unknown error');
    },
  });
};

export const useUnpublishDraft = () => {
  const queryClient = useQueryClient();
  const store = useDraftStore();

  return useMutation({
    mutationFn: (id: string) => draftApi.unpublish(id),
    onSuccess: (response, id) => {
      // Update cache
      queryClient.setQueryData(
        draftKeys.detail(id),
        response
      );
      queryClient.invalidateQueries({ queryKey: draftKeys.lists() });
      queryClient.invalidateQueries({ queryKey: draftKeys.stats() });
      
      // Update store
      store.actions.updateDraft(id, response.data);
    },
    onError: (error) => {
      store.actions.setError(error instanceof Error ? error.message : 'Unknown error');
    },
  });
};

export const useDuplicateDraft = () => {
  const queryClient = useQueryClient();
  const store = useDraftStore();

  return useMutation({
    mutationFn: (id: string) => draftApi.duplicate(id),
    onSuccess: (response) => {
      // Update cache
      queryClient.invalidateQueries({ queryKey: draftKeys.lists() });
      queryClient.invalidateQueries({ queryKey: draftKeys.recent() });
      queryClient.invalidateQueries({ queryKey: draftKeys.stats() });
      
      // Update store
      store.actions.addDraft(response.data);
      store.actions.selectDraft(response.data.id);
    },
    onError: (error) => {
      store.actions.setError(error instanceof Error ? error.message : 'Unknown error');
    },
  });
};

export const useAutoSaveDraft = () => {
  const queryClient = useQueryClient();
  const store = useDraftStore();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => 
      draftApi.autoSave(id, content),
    onSuccess: (response, { id }) => {
      // Update cache (optimistically)
      queryClient.setQueryData(
        draftKeys.detail(id),
        response
      );
      
      // Update store
      store.actions.updateDraft(id, response.data);
    },
        onError: (error) => {
      // For auto-save, we might want to handle errors more gracefully
      // console.error('Auto-save failed:', error);
    },
  });
};
