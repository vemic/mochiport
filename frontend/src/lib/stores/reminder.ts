import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  Reminder, 
  CreateReminderData, 
  UpdateReminderData,
  ReminderFilters 
} from '@ai-chat/shared';

export interface ReminderState {
  // State
  reminders: Reminder[];
  selectedReminderId: string | null;
  loading: boolean;
  error: string | null;
  filters: ReminderFilters;
  
  // Computed
  selectedReminder: Reminder | null;
  upcomingReminders: Reminder[];
  overdueReminders: Reminder[];
  todayReminders: Reminder[];
  
  // Actions
  actions: {
    // Basic CRUD
    setReminders: (reminders: Reminder[]) => void;
    addReminder: (reminder: Reminder) => void;
    updateReminder: (id: string, updates: Partial<Reminder>) => void;
    removeReminder: (id: string) => void;
    
    // Selection
    selectReminder: (id: string | null) => void;
    
    // Filters
    setFilters: (filters: Partial<ReminderFilters>) => void;
    clearFilters: () => void;
    
    // Loading states
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    
    // Async operations
    fetchReminders: (filters?: ReminderFilters) => Promise<void>;
    createReminder: (data: CreateReminderData) => Promise<void>;
    updateReminderAsync: (id: string, data: UpdateReminderData) => Promise<void>;
    deleteReminder: (id: string) => Promise<void>;
    completeReminder: (id: string) => Promise<void>;
    snoozeReminder: (id: string, snoozeUntil: Date) => Promise<void>;
  };
}

export const useReminderStore = create<ReminderState>()(
  devtools(
    (set, get) => ({
      // Initial state
      reminders: [],
      selectedReminderId: null,
      loading: false,
      error: null,
      filters: {},
      
      // Computed values
      get selectedReminder() {
        const { reminders, selectedReminderId } = get();
        return reminders.find(r => r.id === selectedReminderId) || null;
      },
      
      get upcomingReminders() {
        const { reminders } = get();
        const now = new Date();
        return reminders
          .filter(r => r.status === 'pending' && r.dueDate > now)
          .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
      },
      
      get overdueReminders() {
        const { reminders } = get();
        const now = new Date();
        return reminders
          .filter(r => r.status === 'pending' && r.dueDate < now)
          .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
      },
      
      get todayReminders() {
        const { reminders } = get();
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        
        return reminders
          .filter(r => 
            r.status === 'pending' && 
            r.dueDate >= startOfDay && 
            r.dueDate < endOfDay
          )
          .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
      },
      
      actions: {
        // Basic CRUD
        setReminders: (reminders) => 
          set({ reminders }, false, 'setReminders'),
          
        addReminder: (reminder) =>
          set(
            (state) => ({ reminders: [reminder, ...state.reminders] }),
            false,
            'addReminder'
          ),
          
        updateReminder: (id, updates) =>
          set(
            (state) => ({
              reminders: state.reminders.map(r =>
                r.id === id ? { ...r, ...updates } : r
              )
            }),
            false,
            'updateReminder'
          ),
          
        removeReminder: (id) =>
          set(
            (state) => ({
              reminders: state.reminders.filter(r => r.id !== id),
              selectedReminderId: 
                state.selectedReminderId === id ? null : state.selectedReminderId
            }),
            false,
            'removeReminder'
          ),
        
        // Selection
        selectReminder: (id) =>
          set({ selectedReminderId: id }, false, 'selectReminder'),
        
        // Filters
        setFilters: (filters) =>
          set(
            (state) => ({ filters: { ...state.filters, ...filters } }),
            false,
            'setFilters'
          ),
          
        clearFilters: () =>
          set({ filters: {} }, false, 'clearFilters'),
        
        // Loading states
        setLoading: (loading) =>
          set({ loading }, false, 'setLoading'),
          
        setError: (error) =>
          set({ error }, false, 'setError'),
        
        // Async operations
        fetchReminders: async (filters) => {
          const { actions } = get();
          actions.setLoading(true);
          actions.setError(null);
          
          try {
            // TODO: Implement API call
            // const response = await reminderApi.getAll(filters);
            // actions.setReminders(response.data);
            
            // Mock implementation
            actions.setReminders([]);
          } catch (error) {
            actions.setError(error instanceof Error ? error.message : 'Unknown error');
          } finally {
            actions.setLoading(false);
          }
        },
        
        createReminder: async (data) => {
          const { actions } = get();
          actions.setLoading(true);
          actions.setError(null);
          
          try {
            // TODO: Implement API call
            // const reminder = await reminderApi.create(data);
            // actions.addReminder(reminder);            // Mock implementation
            const reminder: Reminder = {
              id: crypto.randomUUID(),
              title: data.title,
              description: data.description || '',
              scheduledAt: data.scheduledAt,
              dueDate: data.scheduledAt, // Use scheduledAt as dueDate
              type: data.type,
              priority: 'medium',
              status: 'pending',
              conversationId: data.conversationId,
              createdAt: new Date(),
              updatedAt: new Date(),
              metadata: data.metadata || {}
            };
            actions.addReminder(reminder);
          } catch (error) {
            actions.setError(error instanceof Error ? error.message : 'Unknown error');
            throw error;
          } finally {
            actions.setLoading(false);
          }
        },
        
        updateReminderAsync: async (id, data) => {
          const { actions } = get();
          actions.setLoading(true);
          actions.setError(null);
          
          try {
            // TODO: Implement API call
            // const updated = await reminderApi.update(id, data);
            // actions.updateReminder(id, updated);
            
            // Mock implementation
            actions.updateReminder(id, { ...data, updatedAt: new Date() });
          } catch (error) {
            actions.setError(error instanceof Error ? error.message : 'Unknown error');
            throw error;
          } finally {
            actions.setLoading(false);
          }
        },
        
        deleteReminder: async (id) => {
          const { actions } = get();
          actions.setLoading(true);
          actions.setError(null);
          
          try {
            // TODO: Implement API call
            // await reminderApi.delete(id);
            actions.removeReminder(id);
          } catch (error) {
            actions.setError(error instanceof Error ? error.message : 'Unknown error');
            throw error;
          } finally {
            actions.setLoading(false);
          }
        },
        
        completeReminder: async (id) => {        const { actions } = get();
          try {
            await actions.updateReminderAsync(id, { 
              status: 'completed'
            });
          } catch (error) {
            throw error;
          }
        },
        
        snoozeReminder: async (id, snoozeUntil) => {        const { actions } = get();
          try {
            await actions.updateReminderAsync(id, { 
              status: 'snoozed',
              snoozeUntil: snoozeUntil.toISOString()
            });
          } catch (error) {
            throw error;
          }
        },
      }
    }),
    {
      name: 'reminder-store',
    }
  )
);
