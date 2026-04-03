export interface SpraxiumContext<T = Record<string, unknown>> {
  readonly id: string;
  data: T;
  readonly createdAt: number;
  readonly ttl: number;
  readonly expiresAt: number;
  readonly restrictedTo?: string;
}

export interface CreateContextOptions {
  ttl?: number;
  restrictedTo?: string;
}
