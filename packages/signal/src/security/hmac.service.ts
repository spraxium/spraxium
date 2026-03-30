import { createHmac, timingSafeEqual } from 'node:crypto';

export class HmacService {
  static compute(nonce: string, sentAt: number, payload: unknown, secret: string): string {
    const message = `${nonce}.${sentAt}.${JSON.stringify(payload)}`;
    return createHmac('sha256', secret).update(message).digest('hex');
  }

  static verify(nonce: string, sentAt: number, payload: unknown, signature: string, secret: string): boolean {
    const expected = HmacService.compute(nonce, sentAt, payload, secret);
    if (signature.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }
}
