export interface SpraxiumContext<T = Record<string, unknown>> {
  readonly id: string;
  data: T;
  readonly createdAt: number;
  /** TTL in seconds. `0` means the context never expires. */
  readonly ttl: number;
  /** Unix timestamp (ms) when the context expires. `0` means the context never expires. */
  readonly expiresAt: number;
  readonly restrictedTo?: string;
}

export interface CreateContextOptions {
  /** TTL in seconds. Use `0` for a context that never expires. */
  ttl?: number;
  restrictedTo?: string;
}
