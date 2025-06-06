import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  key: string;
  options?: {
    auth?: {
      autoRefreshToken?: boolean;
      persistSession?: boolean;
      detectSessionInUrl?: boolean;
    };
    realtime?: {
      timeout?: number;
    };
  };
}

export class SupabaseManager {
  private client: SupabaseClient | null = null;
  private config: SupabaseConfig;

  constructor(config: SupabaseConfig) {
    this.config = config;
  }

  connect(): void {
    try {
      this.client = createClient(
        this.config.url,
        this.config.key,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: false,
            detectSessionInUrl: false,
            ...this.config.options?.auth,
          },
          realtime: {
            timeout: 30000,
            ...this.config.options?.realtime,
          },
          ...this.config.options,
        }
      );

      console.log('✅ Supabase client connected successfully');
    } catch (error) {
      console.error('❌ Supabase client connection failed:', error);
      throw error;
    }
  }

  getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Supabase client not connected. Call connect() first.');
    }
    return this.client;
  }

  // ヘルスチェック
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.client) return false;
      
      // Supabase接続テスト（簡単なクエリ）
      const { error } = await this.client
        .from('conversations')
        .select('count', { count: 'exact', head: true })
        .limit(1);
        
          return !error;
    } catch {
      return false;
    }
  }

  // トランザクション的な操作（Supabaseではクライアント側トランザクションは制限されるため、RPCを使用）
  async transaction<T>(callback: (client: SupabaseClient) => Promise<T>): Promise<T> {
    const client = this.getClient();
    
    // Supabaseではクライアント側のトランザクションが制限されているため、
    // 複雑なトランザクションはPostgreSQL関数として実装することを推奨
    return await callback(client);
  }
}

// 開発環境用の設定
export const developmentSupabaseConfig: SupabaseConfig = {
  url: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  key: process.env.SUPABASE_ANON_KEY || 'your-anon-key',
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false,
    },
  },
};

// シングルトンインスタンス
export const supabaseManager = new SupabaseManager(developmentSupabaseConfig);

// 初期化してクライアントを取得
supabaseManager.connect();

// 便利なエクスポート
export const supabase = supabaseManager.getClient();
