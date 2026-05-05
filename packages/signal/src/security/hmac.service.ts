import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Produces a deterministic JSON string by sorting object keys recursively.
 * This prevents HMAC mismatches caused by V8 re-ordering numeric-like string
 * keys during JSON parse (e.g. `{ "10": …, "2": … }` → `{ "2": …, "10": … }`).
 */
function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key: string, v: unknown) => {
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      return Object.fromEntries(
        Object.keys(v as object)
          .sort()
          .map((k) => [k, (v as Record<string, unknown>)[k]]),
      );
    }
    return v;
  });
}

export class HmacService {
  static compute(nonce: string, sentAt: number, payload: unknown, secret: string): string {
    const message = `${nonce}.${sentAt}.${canonicalJson(payload)}`;
    return createHmac('sha256', secret).update(message).digest('hex');
  }

  static verify(nonce: string, sentAt: number, payload: unknown, signature: string, secret: string): boolean {
    const expected = HmacService.compute(nonce, sentAt, payload, secret);
    if (signature.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }
}
