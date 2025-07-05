// GitHub Pages用のモックAPIクライアント
// 静的ファイルからJSONデータを読み込む

import type { 
  Conversation, 
  Draft, 
  Reminder,
  CreateConversationData,
  CreateDraftData,
  CreateReminderData 
} from '@mochiport/shared';

// 独自ドメインの場合はBASE_PATHを使用しない
const BASE_PATH = process.env.NEXT_PUBLIC_GITHUB_PAGES_CUSTOM_DOMAIN === 'true' ? '' : 
  (process.env.NEXT_PUBLIC_BASE_PATH || '');

class GitHubPagesApiClient {
  private async fetchJson<T>(path: string): Promise<T> {
    const url = `${BASE_PATH}/api${path}.json`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.warn(`Failed to fetch ${url}, returning empty array:`, error);
      return [] as unknown as T;
    }
  }

  // Health Check
  async getHealth() {
    try {
      return await this.fetchJson<{ status: string; message: string; timestamp: string }>('/health');
    } catch {
      return {
        status: 'ok',
        message: 'GitHub Pages Mock API',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    return this.fetchJson<Conversation[]>('/conversations/index');
  }

  async getConversation(id: string): Promise<Conversation | null> {
    try {
      return await this.fetchJson<Conversation>(`/conversations/${id}`);
    } catch {
      const conversations = await this.getConversations();
      return conversations.find(c => c.id === id) || null;
    }
  }

  async createConversation(data: CreateConversationData): Promise<Conversation> {
    // GitHub Pagesでは書き込みできないため、モックデータを返す
    const mockConversation: Conversation = {
      id: `mock-${Date.now()}`,
      title: data.title || 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    };
    
    console.log('Mock: Created conversation', mockConversation);
    return mockConversation;
  }

  async updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation> {
    const existing = await this.getConversation(id);
    if (!existing) {
      throw new Error(`Conversation ${id} not found`);
    }

    const updated: Conversation = {
      ...existing,
      ...data,
      updatedAt: new Date()
    };

    console.log('Mock: Updated conversation', updated);
    return updated;
  }

  async deleteConversation(id: string): Promise<void> {
    console.log('Mock: Deleted conversation', id);
  }

  // Drafts
  async getDrafts(): Promise<Draft[]> {
    return this.fetchJson<Draft[]>('/drafts/index');
  }

  async getDraft(id: string): Promise<Draft | null> {
    try {
      return await this.fetchJson<Draft>(`/drafts/${id}`);
    } catch {
      const drafts = await this.getDrafts();
      return drafts.find(d => d.id === id) || null;
    }
  }

  async createDraft(data: CreateDraftData): Promise<Draft> {
    const mockDraft: Draft = {
      id: `mock-${Date.now()}`,
      title: data.title,
      content: data.content,
      type: data.type,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft',
      ...(data.conversationId && { conversationId: data.conversationId }),
      ...(data.metadata && { metadata: data.metadata })
    };

    console.log('Mock: Created draft', mockDraft);
    return mockDraft;
  }

  async updateDraft(id: string, data: Partial<Draft>): Promise<Draft> {
    const existing = await this.getDraft(id);
    if (!existing) {
      throw new Error(`Draft ${id} not found`);
    }

    const updated: Draft = {
      ...existing,
      ...data,
      updatedAt: new Date()
    };

    console.log('Mock: Updated draft', updated);
    return updated;
  }

  async deleteDraft(id: string): Promise<void> {
    console.log('Mock: Deleted draft', id);
  }

  // Reminders
  async getReminders(): Promise<Reminder[]> {
    return this.fetchJson<Reminder[]>('/reminders/index');
  }

  async getReminder(id: string): Promise<Reminder | null> {
    try {
      return await this.fetchJson<Reminder>(`/reminders/${id}`);
    } catch {
      const reminders = await this.getReminders();
      return reminders.find(r => r.id === id) || null;
    }
  }

  async createReminder(data: CreateReminderData): Promise<Reminder> {
    const mockReminder: Reminder = {
      id: `mock-${Date.now()}`,
      conversationId: data.conversationId || 'mock-conversation',
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      scheduledAt: data.scheduledAt || data.dueDate,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'pending',
      type: data.type || 'general',
      priority: data.priority || 'medium'
    };

    console.log('Mock: Created reminder', mockReminder);
    return mockReminder;
  }

  async updateReminder(id: string, data: Partial<Reminder>): Promise<Reminder> {
    const existing = await this.getReminder(id);
    if (!existing) {
      throw new Error(`Reminder ${id} not found`);
    }

    const updated: Reminder = {
      ...existing,
      ...data,
      updatedAt: new Date()
    };

    console.log('Mock: Updated reminder', updated);
    return updated;
  }

  async deleteReminder(id: string): Promise<void> {
    console.log('Mock: Deleted reminder', id);
  }

  // AI Chat (GitHub Pagesではモック応答のみ)
  async sendMessage(conversationId: string, message: string): Promise<{ response: string }> {
    console.log('Mock: Sending message to conversation', conversationId, message);
    
    // Simple mock responses based on message content
    const responses = [
      "This is a mock response from GitHub Pages. The real AI service is not available in static deployment.",
      "GitHub Pages deployment is working correctly! This is a simulated AI response.",
      "Hello! I'm a mock AI assistant. In a real deployment, I would be powered by Azure OpenAI.",
      "Thanks for testing the GitHub Pages deployment. All frontend features are working!"
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { response: randomResponse };
  }
}

export const githubPagesApiClient = new GitHubPagesApiClient();
