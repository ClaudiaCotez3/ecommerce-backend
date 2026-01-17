import { IdGenerator } from '../domain/IdGenerator';

/**
 * Default ID Generator implementation using crypto.randomUUID()
 * Generates standard UUID v4 strings that are compatible with most systems
 */
export class DefaultIdGenerator implements IdGenerator {
  generateId(): string {
    return crypto.randomUUID();
  }
}
