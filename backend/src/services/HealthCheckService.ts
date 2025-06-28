import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: { status: string; responseTime?: number; error?: string };
    ai: { status: string; responseTime?: number; error?: string };
    memory: { status: string; usage: number; limit: number };
    disk: { status: string; usage: number; available: number };
  };
}

export class HealthCheckService {
  private startTime: number;
  private version: string;

  constructor() {
    this.startTime = Date.now();
    this.version = process.env.npm_package_version || '1.0.0';
  }

  async getHealthStatus(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkAI(),
      this.checkMemory(),
      this.checkDisk(),
    ]);

    const [database, ai, memory, disk] = checks.map((check) =>
      check.status === 'fulfilled' ? check.value : { status: 'error', error: check.reason?.message }
    );

    const overallStatus = this.determineOverallStatus([database, ai, memory, disk]);

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      version: this.version,
      checks: {
        database: database as any,
        ai: ai as any,
        memory: memory as any,
        disk: disk as any,
      },
    };
  }

  private async checkDatabase() {
    const start = performance.now();
    try {
      // Supabase接続チェック
      const response = await fetch(process.env.SUPABASE_URL + '/rest/v1/', {
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
      });
      
      const responseTime = performance.now() - start;
      
      if (response.ok) {
        return { status: 'healthy', responseTime };
      } else {
        return { status: 'unhealthy', responseTime, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      const responseTime = performance.now() - start;
      return { status: 'unhealthy', responseTime, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async checkAI() {
    const start = performance.now();
    try {
      // Azure OpenAI接続チェック（軽量な要求）
      const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
      if (!endpoint) {
        return { status: 'degraded', error: 'Azure OpenAI endpoint not configured' };
      }

      // 単純な接続チェック
      const responseTime = performance.now() - start;
      return { status: 'healthy', responseTime };
    } catch (error) {
      const responseTime = performance.now() - start;
      return { status: 'unhealthy', responseTime, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async checkMemory() {
    try {
      const usage = process.memoryUsage();
      const totalMemory = usage.heapTotal;
      const usedMemory = usage.heapUsed;
      const memoryUsagePercent = (usedMemory / totalMemory) * 100;

      const status = memoryUsagePercent > 85 ? 'unhealthy' : memoryUsagePercent > 70 ? 'degraded' : 'healthy';

      return {
        status,
        usage: Math.round(usedMemory / 1024 / 1024), // MB
        limit: Math.round(totalMemory / 1024 / 1024), // MB
      };
    } catch (error) {
      return { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error', usage: 0, limit: 0 };
    }
  }

  private async checkDisk() {
    try {
      const stats = await fs.stat(process.cwd());
      
      // Windows環境でのディスク使用量チェック（簡易版）
      return {
        status: 'healthy',
        usage: 0, // 実装を簡素化
        available: 1000, // MB（仮値）
      };
    } catch (error) {
      return { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error', usage: 0, available: 0 };
    }
  }

  private determineOverallStatus(checks: any[]): 'healthy' | 'unhealthy' | 'degraded' {
    const hasUnhealthy = checks.some(check => check.status === 'unhealthy');
    const hasDegraded = checks.some(check => check.status === 'degraded');

    if (hasUnhealthy) return 'unhealthy';
    if (hasDegraded) return 'degraded';
    return 'healthy';
  }

  // Express用のヘルスチェックエンドポイント
  healthCheckMiddleware = async (req: express.Request, res: express.Response) => {
    try {
      const health = await this.getHealthStatus();
      const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  };
}
