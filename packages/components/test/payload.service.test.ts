import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryContextAdapter } from '../src/runtime/context/adapters';
import { ContextStore } from '../src/runtime/context/service/context.store';
import { PayloadService } from '../src/runtime/payload/payload.service';

describe('PayloadService', () => {
  let service: PayloadService;

  beforeEach(async () => {
    await ContextStore.initialize(new MemoryContextAdapter());
    ContextStore.destroy();
    await ContextStore.initialize(new MemoryContextAdapter());
    service = new PayloadService();
  });

  it('stores and retrieves a payload', async () => {
    const envelope = await service.create({ name: 'Alice' });
    const data = await service.get<{ name: string }>(envelope.id);
    expect(data).toEqual({ name: 'Alice' });
  });

  it('returns undefined for an unknown id', async () => {
    const data = await service.get('non-existent-id');
    expect(data).toBeUndefined();
  });

  it('deletes a payload', async () => {
    const envelope = await service.create({ name: 'Bob' });
    await service.delete(envelope.id);
    expect(await service.get(envelope.id)).toBeUndefined();
  });

  it('sets expiresAt to 0 when ttl is 0 (never expires)', async () => {
    const envelope = await service.create({ x: 1 }, { ttl: 0 });
    expect(envelope.expiresAt).toBe(0);
    const data = await service.get<{ x: number }>(envelope.id);
    expect(data).toEqual({ x: 1 });
  });

  it('sets a positive expiresAt for non-zero ttl', async () => {
    const before = Date.now();
    const envelope = await service.create({ x: 1 }, { ttl: 60 });
    expect(envelope.expiresAt).toBeGreaterThan(before);
    expect(envelope.expiresAt).toBeLessThanOrEqual(before + 60_000 + 50);
  });

  it('uses the default ttl of 600 seconds when none is provided', async () => {
    const before = Date.now();
    const envelope = await service.create({ y: 2 });
    const expectedExpiry = before + 600_000;
    expect(envelope.expiresAt).toBeGreaterThanOrEqual(expectedExpiry - 50);
    expect(envelope.expiresAt).toBeLessThanOrEqual(expectedExpiry + 50);
  });
});
