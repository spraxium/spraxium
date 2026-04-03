import { describe, expect, it } from 'vitest';
import { HmacService } from '../src/security/hmac.service';

const SECRET = 'test-secret-key';
const NONCE = 'abc-123-nonce';
const SENT_AT = 1700000000000;
const PAYLOAD = { userId: '999', action: 'ban' };

describe('HmacService.compute', () => {
  it('returns a 64-char hex string', () => {
    const sig = HmacService.compute(NONCE, SENT_AT, PAYLOAD, SECRET);
    expect(sig).toMatch(/^[0-9a-f]{64}$/);
  });

  it('produces the same output for identical inputs', () => {
    const a = HmacService.compute(NONCE, SENT_AT, PAYLOAD, SECRET);
    const b = HmacService.compute(NONCE, SENT_AT, PAYLOAD, SECRET);
    expect(a).toBe(b);
  });

  it('is sensitive to nonce changes', () => {
    const a = HmacService.compute(NONCE, SENT_AT, PAYLOAD, SECRET);
    const b = HmacService.compute('different-nonce', SENT_AT, PAYLOAD, SECRET);
    expect(a).not.toBe(b);
  });

  it('is sensitive to sentAt changes', () => {
    const a = HmacService.compute(NONCE, SENT_AT, PAYLOAD, SECRET);
    const b = HmacService.compute(NONCE, SENT_AT + 1, PAYLOAD, SECRET);
    expect(a).not.toBe(b);
  });

  it('is sensitive to payload changes', () => {
    const a = HmacService.compute(NONCE, SENT_AT, PAYLOAD, SECRET);
    const b = HmacService.compute(NONCE, SENT_AT, { ...PAYLOAD, action: 'kick' }, SECRET);
    expect(a).not.toBe(b);
  });

  it('is sensitive to secret changes', () => {
    const a = HmacService.compute(NONCE, SENT_AT, PAYLOAD, SECRET);
    const b = HmacService.compute(NONCE, SENT_AT, PAYLOAD, 'wrong-secret');
    expect(a).not.toBe(b);
  });
});

describe('HmacService.verify', () => {
  it('returns true for a valid signature', () => {
    const sig = HmacService.compute(NONCE, SENT_AT, PAYLOAD, SECRET);
    expect(HmacService.verify(NONCE, SENT_AT, PAYLOAD, sig, SECRET)).toBe(true);
  });

  it('returns false when the secret is wrong', () => {
    const sig = HmacService.compute(NONCE, SENT_AT, PAYLOAD, SECRET);
    expect(HmacService.verify(NONCE, SENT_AT, PAYLOAD, sig, 'wrong-secret')).toBe(false);
  });

  it('returns false when the payload is tampered', () => {
    const sig = HmacService.compute(NONCE, SENT_AT, PAYLOAD, SECRET);
    expect(HmacService.verify(NONCE, SENT_AT, { userId: '000', action: 'unban' }, sig, SECRET)).toBe(false);
  });

  it('returns false when the nonce is tampered', () => {
    const sig = HmacService.compute(NONCE, SENT_AT, PAYLOAD, SECRET);
    expect(HmacService.verify('tampered-nonce', SENT_AT, PAYLOAD, sig, SECRET)).toBe(false);
  });

  it('returns false when sentAt is different', () => {
    const sig = HmacService.compute(NONCE, SENT_AT, PAYLOAD, SECRET);
    expect(HmacService.verify(NONCE, SENT_AT + 1, PAYLOAD, sig, SECRET)).toBe(false);
  });

  it('returns false for a signature with a different length', () => {
    expect(HmacService.verify(NONCE, SENT_AT, PAYLOAD, 'short', SECRET)).toBe(false);
  });

  it('returns false for an empty signature', () => {
    expect(HmacService.verify(NONCE, SENT_AT, PAYLOAD, '', SECRET)).toBe(false);
  });
});
