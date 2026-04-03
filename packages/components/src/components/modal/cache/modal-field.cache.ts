export class ModalFieldCache {
  private static readonly store = new Map<string, { values: Record<string, string>; expiresAt: number }>();

  static key(customId: string, userId: string): string {
    return `${customId}:${userId}`;
  }

  static set(key: string, values: Record<string, string>, ttlSeconds: number): void {
    ModalFieldCache.store.set(key, {
      values,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  static get(key: string): Record<string, string> | null {
    const entry = ModalFieldCache.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      ModalFieldCache.store.delete(key);
      return null;
    }
    return entry.values;
  }

  static delete(key: string): void {
    ModalFieldCache.store.delete(key);
  }

  static get size(): number {
    const now = Date.now();
    for (const [k, v] of ModalFieldCache.store) {
      if (now > v.expiresAt) ModalFieldCache.store.delete(k);
    }
    return ModalFieldCache.store.size;
  }
}
