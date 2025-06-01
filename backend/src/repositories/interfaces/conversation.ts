import { 
  Conversation, 
  CreateConversationData, 
  UpdateConversationData, 
  ConversationFilters 
} from '@ai-chat/shared';
import { BaseRepository, SearchableRepository } from './base';

export interface ConversationRepository 
  extends BaseRepository<Conversation, CreateConversationData, UpdateConversationData, ConversationFilters>,
          SearchableRepository<Conversation> {
  getByStatus(status: Conversation['status']): Promise<Conversation[]>;
  getRecentConversations(limit?: number): Promise<Conversation[]>;
  archiveConversation(id: string): Promise<Conversation>;
  restoreConversation(id: string): Promise<Conversation>;
}
