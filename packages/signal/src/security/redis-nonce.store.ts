import type { RedisNonceClient } from './interfaces/redis-nonce-client.interface';
import type { NonceStore } from './nonce-store.interface';

export class RedisNonceStore implements NonceStore {
  private readonly pending = new Set<Promise<unknown>>();
  private closing?: Promise<void>;

  constructor(
    private readonly client: RedisNonceClient,
    private readonly ttlMs: number,
    private readonly keyPrefix: string,
  ) {}

  async has(nonce: string): Promise<boolean> {
    try {
      return (await this.run(this.client.exists.bind(this.client, this.key(nonce)))) === 1;
    } catch {
      return false;
    }
  }

  async add(nonce: string): Promise<void> {
    await this.addIfAbsent(nonce);
  }

  async addIfAbsent(nonce: string): Promise<boolean> {
    const command = this.client.set.bind(this.client, this.key(nonce), '1', 'PX', this.ttlMs, 'NX');
    return (await this.run(command)) === 'OK';
  }

  destroy(): Promise<void> {
    this.closing ??= this.disconnect();
    return this.closing;
  }

  private key(nonce: string): string {
    return `${this.keyPrefix}${nonce}`;
  }

  private async run<T>(command: () => Promise<T>): Promise<T> {
    if (this.closing) throw new Error('The Redis nonce store is closed.');
    const pending = command();
    this.pending.add(pending);
    try {
      return await pending;
    } finally {
      this.pending.delete(pending);
    }
  }

  private async disconnect(): Promise<void> {
    await Promise.allSettled(this.pending);
    this.client.disconnect();
  }
}
