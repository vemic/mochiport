import { Pool, PoolClient, PoolConfig } from 'pg';

export interface DatabaseConfig {
  connectionString: string;
  poolConfig?: Partial<PoolConfig>;
}

export class DatabaseManager {
  private pool: Pool | null = null;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      this.pool = new Pool({
        connectionString: this.config.connectionString,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        ...this.config.poolConfig,
      });

      // テスト接続
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      console.log('✅ PostgreSQL database connected successfully');
    } catch (error) {
      console.error('❌ PostgreSQL database connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('🔌 PostgreSQL database disconnected');
    }
  }

  getPool(): Pool {
    if (!this.pool) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.pool;
  }

  // ヘルスチェック
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.pool) return false;
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      return true;
    } catch {
      return false;
    }
  }

  // トランザクション実行
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getPool().connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

// 開発環境用の設定
export const developmentDbConfig: DatabaseConfig = {
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/mochiport_dev',
};

// シングルトンインスタンス
export const databaseManager = new DatabaseManager(developmentDbConfig);
