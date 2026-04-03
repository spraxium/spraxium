import { describe, expect, it } from 'vitest';
import { HmacService } from '../../signal/src/security/hmac.service';
import { SignalEnvelopeBuilder } from '../src/signal-envelope-builder';

const SECRET = 'integration-test-secret';

describe('SignalEnvelopeBuilder.build', () => {
  it('sets protocol version 1', () => {
    const builder = new SignalEnvelopeBuilder(SECRET);
    expect(builder.build('user.ban', '111', {}).v).toBe(1);
  });

  it('preserves event name', () => {
    const builder = new SignalEnvelopeBuilder(SECRET);
    expect(builder.build('user.kick', '111', {}).event).toBe('user.kick');
  });

  it('preserves guildId', () => {
    const builder = new SignalEnvelopeBuilder(SECRET);
    expect(builder.build('ping', '999888', {}).guildId).toBe('999888');
  });

  it('preserves payload', () => {
    const builder = new SignalEnvelopeBuilder(SECRET);
    const payload = { userId: '42', reason: 'test' };
    expect(builder.build('user.ban', '111', payload).payload).toEqual(payload);
  });

  it('generates a non-empty nonce on each call', () => {
    const builder = new SignalEnvelopeBuilder(SECRET);
    const a = builder.build('ping', '111', {});
    const b = builder.build('ping', '111', {});
    expect(a.nonce.length).toBeGreaterThan(0);
    expect(a.nonce).not.toBe(b.nonce);
  });

  it('sets sentAt as a unix timestamp in ms', () => {
    const before = Date.now();
    const envelope = new SignalEnvelopeBuilder(SECRET).build('ping', '111', {});
    const after = Date.now();
    expect(envelope.sentAt).toBeGreaterThanOrEqual(before);
    expect(envelope.sentAt).toBeLessThanOrEqual(after);
  });

  it('produces a 64-char hex signature', () => {
    const envelope = new SignalEnvelopeBuilder(SECRET).build('event', '111', {});
    expect(envelope.signature).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('SignalEnvelopeBuilder ↔ HmacService cross-validation', () => {
  it('signature is valid when verified with HmacService using the same secret', () => {
    const builder = new SignalEnvelopeBuilder(SECRET);
    const envelope = builder.build('user.ban', '111222', { userId: '5' });

    const valid = HmacService.verify(
      envelope.nonce,
      envelope.sentAt,
      envelope.payload,
      envelope.signature,
      SECRET,
    );
    expect(valid).toBe(true);
  });

  it('signature fails verification when secret differs', () => {
    const builder = new SignalEnvelopeBuilder(SECRET);
    const envelope = builder.build('user.ban', '111222', { userId: '5' });

    const valid = HmacService.verify(
      envelope.nonce,
      envelope.sentAt,
      envelope.payload,
      envelope.signature,
      'wrong-secret',
    );
    expect(valid).toBe(false);
  });

  it('signature fails verification when payload is tampered', () => {
    const builder = new SignalEnvelopeBuilder(SECRET);
    const envelope = builder.build('user.ban', '111222', { userId: '5' });

    const valid = HmacService.verify(
      envelope.nonce,
      envelope.sentAt,
      { userId: 'tampered' },
      envelope.signature,
      SECRET,
    );
    expect(valid).toBe(false);
  });
});
