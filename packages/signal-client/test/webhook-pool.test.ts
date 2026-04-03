import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WebhookPool } from '../src/webhook-pool';

const URL_1 = 'https://discord.com/api/webhooks/1';
const URL_2 = 'https://discord.com/api/webhooks/2';
const URL_3 = 'https://discord.com/api/webhooks/3';
const URLS = [URL_1, URL_2, URL_3];

describe('WebhookPool constructor', () => {
  it('throws when created with an empty array', () => {
    expect(() => new WebhookPool([])).toThrow('WebhookPool requires at least one webhook URL.');
  });

  it('exposes the correct pool size', () => {
    const pool = new WebhookPool(URLS);
    expect(pool.size).toBe(3);
  });
});

describe('WebhookPool.get', () => {
  it('returns the correct URL for a valid index', () => {
    const pool = new WebhookPool(URLS);
    expect(pool.get(0)).toBe(URLS[0]);
    expect(pool.get(2)).toBe(URLS[2]);
  });

  it('throws RangeError for a negative index', () => {
    const pool = new WebhookPool(URLS);
    expect(() => pool.get(-1)).toThrow(RangeError);
  });

  it('throws RangeError for an out-of-bounds index', () => {
    const pool = new WebhookPool(URLS);
    expect(() => pool.get(3)).toThrow(RangeError);
  });
});

describe('WebhookPool.next (round-robin)', () => {
  it('returns the first webhook on the first call', () => {
    const pool = new WebhookPool(URLS);
    const entry = pool.next();
    expect(entry).not.toBeNull();
    expect(entry?.url).toBe(URL_1);
    expect(entry?.index).toBe(0);
  });

  it('advances the cursor on successive calls', () => {
    const pool = new WebhookPool(URLS);
    expect(pool.next()?.index).toBe(0);
    expect(pool.next()?.index).toBe(1);
    expect(pool.next()?.index).toBe(2);
  });

  it('wraps around to index 0 after exhausting the pool', () => {
    const pool = new WebhookPool(URLS);
    pool.next();
    pool.next();
    pool.next();
    expect(pool.next()?.index).toBe(0);
  });

  it('works correctly with a single-webhook pool', () => {
    const pool = new WebhookPool([URL_1]);
    expect(pool.next()?.index).toBe(0);
    expect(pool.next()?.index).toBe(0);
  });
});

describe('WebhookPool.next (rate-limit aware)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('skips a rate-limited webhook and returns the next available', () => {
    const pool = new WebhookPool(URLS);
    pool.markRateLimited(0, 30_000);
    const entry = pool.next();
    expect(entry?.index).toBe(1);
  });

  it('returns null when all webhooks are rate-limited', () => {
    const pool = new WebhookPool(URLS);
    pool.markRateLimited(0, 30_000);
    pool.markRateLimited(1, 30_000);
    pool.markRateLimited(2, 30_000);
    expect(pool.next()).toBeNull();
  });

  it('makes a webhook available again after its cooldown expires', () => {
    const pool = new WebhookPool([URL_1]);
    pool.markRateLimited(0, 5_000);
    expect(pool.next()).toBeNull();

    vi.advanceTimersByTime(5_001);
    expect(pool.next()).not.toBeNull();
  });
});

describe('WebhookPool.msUntilAvailable', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns 0 when all webhooks are available', () => {
    const pool = new WebhookPool(URLS);
    expect(pool.msUntilAvailable()).toBe(0);
  });

  it('returns 0 when at least one webhook is available', () => {
    const pool = new WebhookPool(URLS);
    pool.markRateLimited(0, 10_000);
    pool.markRateLimited(1, 10_000);
    expect(pool.msUntilAvailable()).toBe(0);
  });

  it('returns positive ms when all are rate-limited', () => {
    const pool = new WebhookPool([URL_1, URL_2]);
    pool.markRateLimited(0, 8_000);
    pool.markRateLimited(1, 15_000);
    const ms = pool.msUntilAvailable();
    expect(ms).toBeGreaterThan(0);
    expect(ms).toBeLessThanOrEqual(8_000);
  });
});

describe('WebhookPool.status', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('marks all webhooks as available when none are rate-limited', () => {
    const pool = new WebhookPool(URLS);
    const statuses = pool.status();
    expect(statuses).toHaveLength(3);
    expect(statuses.every((s) => s.available)).toBe(true);
  });

  it('marks a rate-limited webhook as unavailable', () => {
    const pool = new WebhookPool(URLS);
    pool.markRateLimited(1, 10_000);
    const statuses = pool.status();
    expect(statuses[0]?.available).toBe(true);
    expect(statuses[1]?.available).toBe(false);
    expect(statuses[1]?.rateLimitedUntil).toBeGreaterThan(0);
    expect(statuses[2]?.available).toBe(true);
  });

  it('shows available again after cooldown passes', () => {
    const pool = new WebhookPool([URL_1]);
    pool.markRateLimited(0, 5_000);
    vi.advanceTimersByTime(5_001);
    expect(pool.status()[0]?.available).toBe(true);
    expect(pool.status()[0]?.rateLimitedUntil).toBe(0);
  });
});
