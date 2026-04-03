import { describe, expect, it } from 'vitest';
import { createSignalPayload } from '../src/helpers/create-signal-payload.helper';

describe('createSignalPayload', () => {
  it('sets protocol version to 1', () => {
    const envelope = createSignalPayload('user.ban', '111222');
    expect(envelope.v).toBe(1);
  });

  it('preserves the event name', () => {
    expect(createSignalPayload('role.assign', '111').event).toBe('role.assign');
  });

  it('preserves the guildId', () => {
    expect(createSignalPayload('role.assign', '999888').guildId).toBe('999888');
  });

  it('includes the provided payload', () => {
    const envelope = createSignalPayload('user.ban', '111', { reason: 'spam' });
    expect(envelope.payload).toEqual({ reason: 'spam' });
  });

  it('defaults to an empty payload when none is given', () => {
    const envelope = createSignalPayload('ping', '111');
    expect(envelope.payload).toEqual({});
  });

  it('generates a non-empty nonce', () => {
    const envelope = createSignalPayload('ping', '111');
    expect(typeof envelope.nonce).toBe('string');
    expect(envelope.nonce.length).toBeGreaterThan(0);
  });

  it('generates unique nonces on each call', () => {
    const a = createSignalPayload('ping', '111');
    const b = createSignalPayload('ping', '111');
    expect(a.nonce).not.toBe(b.nonce);
  });

  it('sets sentAt as a positive unix timestamp in milliseconds', () => {
    const before = Date.now();
    const envelope = createSignalPayload('ping', '111');
    const after = Date.now();
    expect(envelope.sentAt).toBeGreaterThanOrEqual(before);
    expect(envelope.sentAt).toBeLessThanOrEqual(after);
  });
});
