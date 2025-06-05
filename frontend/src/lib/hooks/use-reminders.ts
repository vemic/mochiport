import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reminderApi } from '../api';
import { useReminderStore } from '../stores';
import { 
  Reminder, 
  CreateReminderData, 
  UpdateReminderData, 
  ReminderFilters 
} from '@ai-chat/shared';

// Query keys
export const reminderKeys = {
  all: ['reminders'] as const,
  lists: () => [...reminderKeys.all, 'list'] as const,
  list: (filters: ReminderFilters) => [...reminderKeys.lists(), filters] as const,
  details: () => [...reminderKeys.all, 'detail'] as const,
  detail: (id: string) => [...reminderKeys.details(), id] as const,
  upcoming: () => [...reminderKeys.all, 'upcoming'] as const,
  overdue: () => [...reminderKeys.all, 'overdue'] as const,
  today: () => [...reminderKeys.all, 'today'] as const,
  stats: () => [...reminderKeys.all, 'stats'] as const,
};

// Hooks
export const useReminders = (filters?: ReminderFilters) => {
  return useQuery({
    queryKey: reminderKeys.list(filters || {}),
    queryFn: () => reminderApi.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useReminder = (id: string, enabled = true) => {
  return useQuery({
    queryKey: reminderKeys.detail(id),
    queryFn: () => reminderApi.getById(id),
    enabled: enabled && !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useUpcomingReminders = (limit = 10) => {
  return useQuery({
    queryKey: [...reminderKeys.upcoming(), limit],
    queryFn: () => reminderApi.getUpcoming(limit),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useOverdueReminders = () => {
  return useQuery({
    queryKey: reminderKeys.overdue(),
    queryFn: () => reminderApi.getOverdue(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

export const useTodayReminders = () => {
  return useQuery({
    queryKey: reminderKeys.today(),
    queryFn: () => reminderApi.getToday(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useReminderStats = () => {
  return useQuery({
    queryKey: reminderKeys.stats(),
    queryFn: () => reminderApi.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateReminder = () => {
  const queryClient = useQueryClient();
  const store = useReminderStore();

  return useMutation({
    mutationFn: (data: CreateReminderData) => reminderApi.create(data),
    onSuccess: (response) => {
      // Update cache
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reminderKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: reminderKeys.today() });
      queryClient.invalidateQueries({ queryKey: reminderKeys.stats() });
      
      // Update store
      store.actions.addReminder(response.data);
      store.actions.selectReminder(response.data.id);
    },
    onError: (error) => {
      store.actions.setError(error instanceof Error ? error.message : 'Unknown error');
    },
  });
};

export const useUpdateReminder = () => {
  const queryClient = useQueryClient();
  const store = useReminderStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReminderData }) => 
      reminderApi.update(id, data),
    onSuccess: (response, { id }) => {
      // Update cache
      queryClient.setQueryData(
        reminderKeys.detail(id),
        response
      );
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reminderKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: reminderKeys.overdue() });
      queryClient.invalidateQueries({ queryKey: reminderKeys.today() });
      queryClient.invalidateQueries({ queryKey: reminderKeys.stats() });
      
      // Update store
      store.actions.updateReminder(id, response.data);
    },
    onError: (error) => {
      store.actions.setError(error instanceof Error ? error.message : 'Unknown error');
    },
  });
};

export const useDeleteReminder = () => {
  const queryClient = useQueryClient();
  const store = useReminderStore();

  return useMutation({
    mutationFn: (id: string) => reminderApi.delete(id),
    onSuccess: (_, id) => {
      // Update cache
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reminderKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: reminderKeys.overdue() });
      queryClient.invalidateQueries({ queryKey: reminderKeys.today() });
      queryClient.invalidateQueries({ queryKey: reminderKeys.stats() });
      queryClient.removeQueries({ queryKey: reminderKeys.detail(id) });
      
      // Update store
      store.actions.removeReminder(id);
    },
    onError: (error) => {
      store.actions.setError(error instanceof Error ? error.message : 'Unknown error');
    },
  });
};

export const useCompleteReminder = () => {
  const queryClient = useQueryClient();
  const store = useReminderStore();

  return useMutation({
    mutationFn: (id: string) => reminderApi.complete(id),
    onSuccess: (response, id) => {
      // Update cache
      queryClient.setQueryData(
        reminderKeys.detail(id),
        response
      );
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reminderKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: reminderKeys.overdue() });
      queryClient.invalidateQueries({ queryKey: reminderKeys.today() });
      queryClient.invalidateQueries({ queryKey: reminderKeys.stats() });
      
      // Update store
      store.actions.updateReminder(id, response.data);
    },
    onError: (error) => {
      store.actions.setError(error instanceof Error ? error.message : 'Unknown error');
    },
  });
};

export const useSnoozeReminder = () => {
  const queryClient = useQueryClient();
  const store = useReminderStore();

  return useMutation({
    mutationFn: ({ id, snoozeUntil }: { id: string; snoozeUntil: Date }) => 
      reminderApi.snooze(id, snoozeUntil),
    onSuccess: (response, { id }) => {
      // Update cache
      queryClient.setQueryData(
        reminderKeys.detail(id),
        response
      );
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reminderKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: reminderKeys.overdue() });
      queryClient.invalidateQueries({ queryKey: reminderKeys.today() });
      queryClient.invalidateQueries({ queryKey: reminderKeys.stats() });
      
      // Update store
      store.actions.updateReminder(id, response.data);
    },
    onError: (error) => {
      store.actions.setError(error instanceof Error ? error.message : 'Unknown error');
    },
  });
};
