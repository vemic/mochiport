import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../config/supabase.js';

/**
 * データベースサービスファクトリー
 * 環境変数に基づいてモックまたは実際のSupabaseを使用するかを決定
 */
export class DatabaseServiceFactory {
  private static useMock: boolean = process.env.USE_MOCK_DATABASE === 'true';

  static getSupabaseClient(): SupabaseClient | null {
    if (this.useMock) {
      console.log('Using Mock Database (Supabase client disabled)');
      return null;
    }

    console.log('Using Supabase Database');
    return supabase;
  }

  static isUsingMock(): boolean {
    return this.useMock;
  }

  // テスト用にモック状態を設定
  static setMockMode(enabled: boolean): void {
    this.useMock = enabled;
  }
}

/**
 * Supabaseベースサービスの抽象クラス
 */
export abstract class SupabaseBaseService<T, TCreate, TUpdate> {
  protected client: SupabaseClient | null;
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.client = DatabaseServiceFactory.getSupabaseClient();
  }

  protected isUsingMock(): boolean {
    return DatabaseServiceFactory.isUsingMock();
  }

  protected validateAndThrow(data: TCreate | TUpdate): void {
    const validation = this.validate(data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
  }

  protected abstract validate(data: TCreate | TUpdate): { success: boolean; errors: string[] };

  protected generateId(): string {
    return crypto.randomUUID();
  }

  protected getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  protected handleError(error: Error, message: string): void {
    console.error(`${message}:`, error);
  }

  // Supabaseクエリのヘルパーメソッド
  protected async executeQuery<TResult>(
    queryBuilder: () => Promise<{ data: TResult[] | null; error: any }>
  ): Promise<TResult[]> {
    if (this.isUsingMock()) {
      throw new Error('Cannot execute Supabase query in mock mode');
    }

    const { data, error } = await queryBuilder();

    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    return data || [];
  }

  protected async executeSingleQuery<TResult>(
    queryBuilder: () => Promise<{ data: TResult | null; error: any }>
  ): Promise<TResult | null> {
    if (this.isUsingMock()) {
      throw new Error('Cannot execute Supabase query in mock mode');
    }

    const { data, error } = await queryBuilder();

    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    return data;
  }
}
