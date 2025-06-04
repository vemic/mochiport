// ドラフト関連の型定義
export interface Draft {
  id: string;
  conversationId?: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  status: DraftStatus;
  type: DraftType;
  metadata?: DraftMetadata;
}

export type DraftStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived';

export type DraftType = 'response' | 'summary' | 'analysis' | 'note' | 'template';

export interface DraftMetadata {
  tags?: string[];
  category?: string;
  templateId?: string;
  version?: number;
  author?: string;
  autoSaveCount?: number;
  wordCount?: number;
  archiveReason?: string;
  originalDraftId?: string;
}

// ドラフト作成・更新用の型
export interface CreateDraftData {
  conversationId?: string;
  title: string;
  content: string;
  type: DraftType;
  metadata?: Partial<DraftMetadata>;
}

export interface UpdateDraftData {
  title?: string;
  content?: string;
  status?: DraftStatus;
  type?: DraftType;
  conversationId?: string;
  metadata?: Partial<DraftMetadata>;
}

// ドラフト一括操作用の型
export interface BulkDraftOperation {
  draftIds: string[];
  operation: 'approve' | 'publish' | 'archive' | 'delete';
  metadata?: Record<string, unknown>;
}

// ドラフトフィルター用の型
export interface DraftFilters {
  page?: number;
  limit?: number;
  offset?: number;
  status?: DraftStatus | DraftStatus[];
  type?: DraftType | DraftType[];
  conversationId?: string;
  title?: string;
  content?: string;
  category?: string;
  author?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
}
