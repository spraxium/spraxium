import { beforeEach, describe, expect, it, vi } from 'vitest';

const { initializeMock, fileCtorMock, sqliteCtorMock, redisCtorMock } = vi.hoisted(() => ({
  initializeMock: vi.fn(async () => undefined),
  fileCtorMock: vi.fn(),
  sqliteCtorMock: vi.fn(),
  redisCtorMock: vi.fn(),
}));

vi.mock('../src/runtime/context', () => {
  class FileContextAdapter {
    constructor(options: unknown) {
      fileCtorMock(options);
    }
  }

  class SqliteContextAdapter {
    constructor(options: unknown) {
      sqliteCtorMock(options);
    }
  }

  class RedisContextAdapter {
    constructor(options: unknown) {
      redisCtorMock(options);
    }
  }

  return {
    ContextStore: {
      defaultTtl: 300,
      initialize: initializeMock,
    },
    FileContextAdapter,
    SqliteContextAdapter,
    RedisContextAdapter,
  };
});

import {
  ContextStore,
  FileContextAdapter,
  RedisContextAdapter,
  SqliteContextAdapter,
} from '../src/runtime/context';
import { initContextAdapter } from '../src/runtime/lifecycle/context-adapter.factory';

describe('initContextAdapter', () => {
  beforeEach(() => {
    initializeMock.mockClear();
    fileCtorMock.mockClear();
    sqliteCtorMock.mockClear();
    redisCtorMock.mockClear();
    ContextStore.defaultTtl = 300;
  });

  it('sets default TTL even when storage config is not provided', async () => {
    await initContextAdapter(undefined, 900);
    expect(ContextStore.defaultTtl).toBe(900);
    expect(initializeMock).not.toHaveBeenCalled();
  });

  it('initializes file adapter when type is file', async () => {
    await initContextAdapter({ type: 'file', dir: '.cache' });

    expect(fileCtorMock).toHaveBeenCalledWith({ dir: '.cache' });
    expect(initializeMock).toHaveBeenCalledWith(expect.any(FileContextAdapter));
  });

  it('initializes sqlite adapter when type is sqlite', async () => {
    await initContextAdapter({ type: 'sqlite', path: '.spraxium/contexts.db' });

    expect(sqliteCtorMock).toHaveBeenCalledWith({ path: '.spraxium/contexts.db' });
    expect(initializeMock).toHaveBeenCalledWith(expect.any(SqliteContextAdapter));
  });

  it('initializes redis adapter when type is redis', async () => {
    const cfg = {
      type: 'redis',
      host: 'redis.internal',
      username: 'component-cache',
      password: 'test-only-password',
    } as const;
    await initContextAdapter(cfg);

    expect(redisCtorMock).toHaveBeenCalledWith(cfg);
    expect(initializeMock).toHaveBeenCalledWith(expect.any(RedisContextAdapter));
  });

  it('throws for invalid storage config type', async () => {
    await expect(initContextAdapter({ type: 'invalid' } as never)).rejects.toThrow(
      '[Spraxium] Invalid context.storage value',
    );
    expect(initializeMock).not.toHaveBeenCalled();
  });
});
