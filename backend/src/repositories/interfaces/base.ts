import { PaginationParams, PaginatedResponse } from '@mochiport/shared';

// ベースリポジトリインターフェース
export interface BaseRepository<T, TCreate, TUpdate, TFilters = Record<string, unknown>> {
  findById(id: string): Promise<T | null>;
  findMany(filters: TFilters): Promise<PaginatedResponse<T>>;
  create(data: TCreate): Promise<T>;
  update(id: string, data: TUpdate): Promise<T | null>;
  delete(id: string): Promise<void>;
  count(filters?: Partial<TFilters>): Promise<number>;
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
