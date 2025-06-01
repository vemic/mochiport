import { ValidationResult } from '@ai-chat/shared';
import { ValidationError } from '../utils/errors';

export abstract class BaseService<T, TCreate, TUpdate> {
  abstract validate(data: Partial<T>): Promise<ValidationResult>;
  
  protected async validateAndThrow(data: Partial<T>): Promise<void> {
    const validation = await this.validate(data);
    if (!validation.isValid) {
      throw new ValidationError('Validation failed', { errors: validation.errors });
    }
  }
  
  protected generateId(): string {
    return crypto.randomUUID();
  }
  
  protected getCurrentTimestamp(): Date {
    return new Date();
  }
}
