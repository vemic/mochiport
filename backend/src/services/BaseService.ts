import { ValidationError } from '../utils/errors.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export abstract class BaseService<T, TCreate, TUpdate> {
  protected abstract validate(data: TCreate | TUpdate): { success: boolean; errors: any[] };
    protected validateAndThrow(data: TCreate | TUpdate): void {
    const validation = this.validate(data);
    if (!validation.success) {
      throw new ValidationError('Validation failed', validation.errors);
    }
  }
  
  protected generateId(): string {
    return crypto.randomUUID();
  }
  
  protected getCurrentTimestamp(): Date {
    return new Date();
  }

  protected handleError(error: Error, message: string): void {
    console.error(`${message}:`, error);
    // 追加のエラーハンドリングロジックをここに追加可能
  }
}
