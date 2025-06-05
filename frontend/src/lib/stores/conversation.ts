import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  Conversation, 
  CreateConversationData, 
  UpdateConversationData,
  ConversationFilters 
} from '@mochiport/shared';

export interface ConversationState {
  // State
  conversations: Conversation[];
  selectedConversationId: string | null;
  loading: boolean;
  error: string | null;
  filters: ConversationFilters;
  
  // Computed
  selectedConversation: Conversation | null;
  
  // Actions
  actions: {
    // Basic CRUD
    setConversations: (conversations: Conversation[]) => void;
    addConversation: (conversation: Conversation) => void;
    updateConversation: (id: string, updates: Partial<Conversation>) => void;
    removeConversation: (id: string) => void;
    
    // Selection
    selectConversation: (id: string | null) => void;
    
    // Filters
    setFilters: (filters: Partial<ConversationFilters>) => void;
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
      loading: false,
      error: null,
      filters: {},
      
      // Computed values
      get selectedConversation() {
        const { conversations, selectedConversationId } = get();
        return conversations.find(c => c.id === selectedConversationId) || null;
      },
      
      actions: {
        // Basic CRUD
        setConversations: (conversations) => 
          set({ conversations }, false, 'setConversations'),
          
        addConversation: (conversation) =>
          set(
            (state) => ({ conversations: [conversation, ...state.conversations] }),
            false,
            'addConversation'
          ),
          
        updateConversation: (id, updates) =>
          set(
            (state) => ({
              conversations: state.conversations.map(c =>
                c.id === id ? { ...c, ...updates } : c
              )
            }),
            false,
            'updateConversation'
          ),
          
        removeConversation: (id) =>
          set(
            (state) => ({
              conversations: state.conversations.filter(c => c.id !== id),
              selectedConversationId: 
                state.selectedConversationId === id ? null : state.selectedConversationId
            }),
            false,
            'removeConversation'
          ),
        
        // Selection
        selectConversation: (id) =>
          set({ selectedConversationId: id }, false, 'selectConversation'),
        
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
        
        // Async operations (placeholder implementations)
        fetchConversations: async (filters) => {
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
        
        createConversation: async (data) => {
          const { actions } = get();
          actions.setLoading(true);
          actions.setError(null);
          
          try {
            // TODO: Implement API call
            // const conversation = await conversationApi.create(data);
            // actions.addConversation(conversation);
            
            // Mock implementation
            const conversation: Conversation = {
              id: crypto.randomUUID(),
              title: data.title,
              messages: [],
              createdAt: new Date(),
              updatedAt: new Date(),
              status: 'active',
              metadata: data.metadata
            };
            actions.addConversation(conversation);
          } catch (error) {
            actions.setError(error instanceof Error ? error.message : 'Unknown error');
            throw error;
          } finally {
            actions.setLoading(false);
          }
        },
        
        updateConversationAsync: async (id, data) => {
          const { actions } = get();
          actions.setLoading(true);
          actions.setError(null);
          
          try {
            // TODO: Implement API call
            // const updated = await conversationApi.update(id, data);
            // actions.updateConversation(id, updated);
            
            // Mock implementation
            actions.updateConversation(id, { ...data, updatedAt: new Date() });
          } catch (error) {
            actions.setError(error instanceof Error ? error.message : 'Unknown error');
            throw error;
          } finally {
            actions.setLoading(false);
          }
        },
        
        deleteConversation: async (id) => {
          const { actions } = get();
          actions.setLoading(true);
          actions.setError(null);
          
          try {
            // TODO: Implement API call
            // await conversationApi.delete(id);
            actions.removeConversation(id);
          } catch (error) {
            actions.setError(error instanceof Error ? error.message : 'Unknown error');
            throw error;
          } finally {
            actions.setLoading(false);
          }
        },
        
        archiveConversation: async (id) => {
          const { actions } = get();
          try {
            await actions.updateConversationAsync(id, { status: 'archived' });
          } catch (error) {
            throw error;
          }
        },
        
        restoreConversation: async (id) => {
          const { actions } = get();
          try {
            await actions.updateConversationAsync(id, { status: 'active' });
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
