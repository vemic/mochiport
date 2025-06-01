import { PaginationParams, PaginatedResponse } from '@ai-chat/shared';

// ベースリポジトリインターフェース
export interface BaseRepository<T, TCreate, TUpdate, TFilters = Record<string, unknown>> {
  getById(id: string): Promise<T | null>;
  getAll(filters?: TFilters): Promise<PaginatedResponse<T>>;
  create(data: TCreate): Promise<T>;
  update(id: string, data: TUpdate): Promise<T>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}

// 検索機能付きリポジトリ
export interface SearchableRepository<T> {
  search(query: string, filters?: Record<string, unknown>): Promise<T[]>;
}

// 一括操作対応リポジトリ
export interface BulkRepository<T, TBulkOperation> {
  bulkCreate(items: T[]): Promise<T[]>;
  bulkUpdate(operations: TBulkOperation[]): Promise<T[]>;
  bulkDelete(ids: string[]): Promise<void>;
}
