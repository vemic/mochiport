import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  Draft, 
  CreateDraftData, 
  UpdateDraftData,
  DraftFilters 
} from '@mochiport/shared';

export interface DraftState {
  // State
  drafts: Draft[];
  selectedDraftId: string | null;
  loading: boolean;
  error: string | null;
  filters: DraftFilters;
  
  // Computed
  selectedDraft: Draft | null;
  recentDrafts: Draft[];
  publishedDrafts: Draft[];
  
  // Actions
  actions: {
    // Basic CRUD
    setDrafts: (drafts: Draft[]) => void;
    addDraft: (draft: Draft) => void;
    updateDraft: (id: string, updates: Partial<Draft>) => void;
    removeDraft: (id: string) => void;
    
    // Selection
    selectDraft: (id: string | null) => void;
    
    // Filters
    setFilters: (filters: Partial<DraftFilters>) => void;
    clearFilters: () => void;
    
    // Loading states
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    
    // Async operations
    fetchDrafts: (filters?: DraftFilters) => Promise<void>;
    createDraft: (data: CreateDraftData) => Promise<void>;
    updateDraftAsync: (id: string, data: UpdateDraftData) => Promise<void>;
    deleteDraft: (id: string) => Promise<void>;
    publishDraft: (id: string) => Promise<void>;
    unpublishDraft: (id: string) => Promise<void>;
    duplicateDraft: (id: string) => Promise<void>;
    
    // Auto-save functionality
    autoSave: (id: string, content: string) => void;
  };
}

export const useDraftStore = create<DraftState>()(
  devtools(
    (set, get) => ({
      // Initial state
      drafts: [],
      selectedDraftId: null,
      loading: false,
      error: null,
      filters: {},
      
      // Computed values
      get selectedDraft() {
        const { drafts, selectedDraftId } = get();
        return drafts.find(d => d.id === selectedDraftId) || null;
      },
      
      get recentDrafts() {
        const { drafts } = get();
        return drafts
          .filter(d => d.status === 'draft')
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          .slice(0, 10);
      },
        get publishedDrafts() {
        const { drafts } = get();
        return drafts
          .filter(d => d.status === 'published')
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      },
      
      actions: {
        // Basic CRUD
        setDrafts: (drafts) => 
          set({ drafts }, false, 'setDrafts'),
          
        addDraft: (draft) =>
          set(
            (state) => ({ drafts: [draft, ...state.drafts] }),
            false,
            'addDraft'
          ),
          
        updateDraft: (id, updates) =>
          set(
            (state) => ({
              drafts: state.drafts.map(d =>
                d.id === id ? { ...d, ...updates } : d
              )
            }),
            false,
            'updateDraft'
          ),
          
        removeDraft: (id) =>
          set(
            (state) => ({
              drafts: state.drafts.filter(d => d.id !== id),
              selectedDraftId: 
                state.selectedDraftId === id ? null : state.selectedDraftId
            }),
            false,
            'removeDraft'
          ),
        
        // Selection
        selectDraft: (id) =>
          set({ selectedDraftId: id }, false, 'selectDraft'),
        
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
        fetchDrafts: async (filters) => {
          const { actions } = get();
          actions.setLoading(true);
          actions.setError(null);
          
          try {
            // TODO: Implement API call
            // const response = await draftApi.getAll(filters);
            // actions.setDrafts(response.data);
            
            // Mock implementation
            actions.setDrafts([]);
          } catch (error) {
            actions.setError(error instanceof Error ? error.message : 'Unknown error');
          } finally {
            actions.setLoading(false);
          }
        },
        
        createDraft: async (data) => {
          const { actions } = get();
          actions.setLoading(true);
          actions.setError(null);
              try {
            // TODO: Implement API call
            // const draft = await draftApi.create(data);
            // actions.addDraft(draft);
            
            // Mock implementation
            const draft: Draft = {
              id: crypto.randomUUID(),
              title: data.title,
              content: data.content,
              type: data.type,
              status: 'draft',
              conversationId: data.conversationId,
              createdAt: new Date(),
              updatedAt: new Date(),
              metadata: data.metadata
            };
            actions.addDraft(draft);
          } catch (error) {
            actions.setError(error instanceof Error ? error.message : 'Unknown error');
            throw error;
          } finally {
            actions.setLoading(false);
          }
        },
        
        updateDraftAsync: async (id, data) => {
          const { actions } = get();
          actions.setLoading(true);
          actions.setError(null);
          
          try {
            // TODO: Implement API call
            // const updated = await draftApi.update(id, data);
            // actions.updateDraft(id, updated);
            
            // Mock implementation
            actions.updateDraft(id, { ...data, updatedAt: new Date() });
          } catch (error) {
            actions.setError(error instanceof Error ? error.message : 'Unknown error');
            throw error;
          } finally {
            actions.setLoading(false);
          }
        },
        
        deleteDraft: async (id) => {
          const { actions } = get();
          actions.setLoading(true);
          actions.setError(null);
          
          try {
            // TODO: Implement API call
            // await draftApi.delete(id);
            actions.removeDraft(id);
          } catch (error) {
            actions.setError(error instanceof Error ? error.message : 'Unknown error');
            throw error;
          } finally {
            actions.setLoading(false);
          }
        },
        
        publishDraft: async (id) => {
          const { actions } = get();        try {
            await actions.updateDraftAsync(id, { 
              status: 'published'
            });
          } catch (error) {
            throw error;
          }
        },
        
        unpublishDraft: async (id) => {
          const { actions } = get();        try {
            await actions.updateDraftAsync(id, { 
              status: 'draft'
            });
          } catch (error) {
            throw error;
          }
        },
        
        duplicateDraft: async (id) => {
          const { actions, drafts } = get();
          const original = drafts.find(d => d.id === id);
          
          if (!original) {
            throw new Error('Draft not found');
          }
              try {
            await actions.createDraft({
              title: `${original.title} (コピー)`,
              content: original.content,
              type: original.type,
              conversationId: original.conversationId,
              metadata: { ...original.metadata }
            });
          } catch (error) {
            throw error;
          }
        },
        
        // Auto-save functionality
        autoSave: (id, content) => {
          const { actions } = get();
          // Debounced auto-save implementation would go here
          // For now, just update the content immediately
          actions.updateDraft(id, { 
            content,
            updatedAt: new Date()
          });
        },
      }
    }),
    {
      name: 'draft-store',
    }
  )
);
