import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  ConversationSummary,
  CreateConversationData, 
  UpdateConversationData,
  ConversationFilters 
} from '@mochiport/shared';

export interface ConversationState {
  // State
  conversations: ConversationSummary[];
  selectedConversationId: string | null;
  loading: boolean;
  error: string | null;
  filters: ConversationFilters;
    // Actions
  actions: {    // Basic CRUD
    setConversations: (_conversations: ConversationSummary[]) => void;
    addConversation: (_conversation: ConversationSummary) => void;
    updateConversation: (_id: string, _updates: Partial<ConversationSummary>) => void;
    removeConversation: (_id: string) => void;
    
    // Selection
    selectConversation: (_id: string | null) => void;
    
    // Filters
    setFilters: (_filters: Partial<ConversationFilters>) => void;
    clearFilters: () => void;
    
    // Loading states
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    
    // Async operations (would connect to API)
    fetchConversations: (filters?: ConversationFilters) => Promise<void>;
    createConversation: (data: CreateConversationData) => Promise<void>;
    updateConversationAsync: (id: string, data: UpdateConversationData) => Promise<void>;
    deleteConversation: (id: string) => Promise<void>;
    archiveConversation: (id: string) => Promise<void>;
    restoreConversation: (id: string) => Promise<void>;
  };
}

export const useConversationStore = create<ConversationState>()(
  devtools(
    (set, get) => ({
      // Initial state
      conversations: [],
      selectedConversationId: null,
      loading: false,      error: null,
      filters: {},
        actions: {
        // Basic CRUD
        setConversations: (_conversations) => 
          set({ conversations: _conversations }, false, 'setConversations'),
          
        addConversation: (_conversation) =>
          set(
            (state) => ({ conversations: [_conversation, ...state.conversations] }),
            false,
            'addConversation'
          ),
          
        updateConversation: (_id, _updates) =>
          set(
            (state) => ({
              conversations: state.conversations.map(c =>
                c.id === _id ? { ...c, ..._updates } : c
              )
            }),
            false,
            'updateConversation'
          ),
            removeConversation: (_id) =>
          set(
            (state) => ({
              conversations: state.conversations.filter(c => c.id !== _id),
              selectedConversationId: 
                state.selectedConversationId === _id ? null : state.selectedConversationId
            }),
            false,
            'removeConversation'
          ),
        
        // Selection
        selectConversation: (_id) =>
          set({ selectedConversationId: _id }, false, 'selectConversation'),
        
        // Filters
        setFilters: (_filters) =>
          set(
            (state) => ({ filters: { ...state.filters, ..._filters } }),
            false,
            'setFilters'
          ),
          
        clearFilters: () =>
          set({ filters: {} }, false, 'clearFilters'),
        
        // Loading states
        setLoading: (_loading) =>
          set({ loading: _loading }, false, 'setLoading'),
          
        setError: (_error) =>
          set({ error: _error }, false, 'setError'),
        
        // Async operations (placeholder implementations)
        fetchConversations: async (_filters) => {
          const { actions } = get();
          actions.setLoading(true);
          actions.setError(null);
          
          try {
            // TODO: Implement API call
            // const response = await conversationApi.getAll(filters);
            // actions.setConversations(response.data);
            
            // Mock implementation
            actions.setConversations([]);
          } catch (error) {
            actions.setError(error instanceof Error ? error.message : 'Unknown error');
          } finally {
            actions.setLoading(false);
          }
        },
          createConversation: async (_data) => {
          const { actions } = get();
          actions.setLoading(true);
          actions.setError(null);
          
          try {
            // TODO: Implement API call
            // const conversation = await conversationApi.create(data);
            // actions.addConversation(conversation);
              // Mock implementation
            const conversation: ConversationSummary = {
              id: crypto.randomUUID(),
              title: _data.title,
              messageCount: 0,
              status: 'active',
              createdAt: new Date(),
              updatedAt: new Date(),
              metadata: _data.metadata
            };
            actions.addConversation(conversation);
          } catch (error) {
            actions.setError(error instanceof Error ? error.message : 'Unknown error');
            throw error;
          } finally {
            actions.setLoading(false);
          }
        },
          updateConversationAsync: async (_id, _data) => {
          const { actions } = get();
          actions.setLoading(true);
          actions.setError(null);
          
          try {
            // TODO: Implement API call
            // const updated = await conversationApi.update(id, data);
            // actions.updateConversation(id, updated);
            
            // Mock implementation
            actions.updateConversation(_id, { ..._data, updatedAt: new Date() });
          } catch (error) {
            actions.setError(error instanceof Error ? error.message : 'Unknown error');
            throw error;
          } finally {
            actions.setLoading(false);
          }
        },
        
        deleteConversation: async (_id) => {
          const { actions } = get();
          actions.setLoading(true);
          actions.setError(null);
            try {
            // TODO: Implement API call
            // await conversationApi.delete(_id);
            actions.removeConversation(_id);
          } catch (error) {
            actions.setError(error instanceof Error ? error.message : 'Unknown error');
            throw error;
          } finally {
            actions.setLoading(false);
          }
        },
        
        archiveConversation: async (_id) => {
          const { actions } = get();
          try {
            await actions.updateConversationAsync(_id, { status: 'archived' });
          } catch (error) {
            throw error;
          }
        },
          restoreConversation: async (_id) => {
          const { actions } = get();
          try {
            await actions.updateConversationAsync(_id, { status: 'active' });
          } catch (error) {
            throw error;
          }
        },
      }
    }),
    {
      name: 'conversation-store',
    }
  )
);
