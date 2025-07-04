import { 
  Conversation, 
  CreateConversationData, 
  UpdateConversationData, 
  ConversationFilters,
  PaginatedResponse 
} from '@mochiport/shared';
import { BaseRepository, SearchableRepository } from './base.js';

export interface ConversationRepository 
  extends BaseRepository<Conversation, CreateConversationData, UpdateConversationData, ConversationFilters>,
          SearchableRepository<Conversation> {
  // 基本のfind操作
  findById(id: string): Promise<Conversation | null>;
  findMany(filters: ConversationFilters): Promise<PaginatedResponse<Conversation>>;
  
  // 特殊な検索・操作
  getByStatus(status: Conversation['status']): Promise<Conversation[]>;
  getRecentConversations(limit?: number): Promise<Conversation[]>;
  archiveConversation(id: string): Promise<Conversation>;
  restoreConversation(id: string): Promise<Conversation>;
}
