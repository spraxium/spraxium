import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { Injectable } from '@spraxium/common';
import type { CreateContextOptions, SpraxiumContext } from '../interfaces/spraxium-context.interface';
import { ContextStore } from './context.store';

function generateId(): string {
  return randomUUID();
}

/**
 * Injectable service that provides a high-level API for managing flow contexts.
 * Delegates all storage to `ContextStore`, which in turn uses the configured
 * `ContextStorageAdapter` (memory, file, or Redis).
 */
@Injectable()
export class ContextService {
  async create<T = Record<string, unknown>>(
    data: T,
    options?: CreateContextOptions,
  ): Promise<SpraxiumContext<T>> {
    const ttl = options?.ttl ?? ContextStore.defaultTtl;
    const now = Date.now();
    const ctx: SpraxiumContext<T> = {
      id: generateId(),
      data,
      createdAt: now,
      ttl,
      expiresAt: now + ttl * 1_000,
      restrictedTo: options?.restrictedTo,
    };
    await ContextStore.set(ctx as SpraxiumContext<unknown>);
    return ctx;
  }

  async get<T = Record<string, unknown>>(id: string): Promise<SpraxiumContext<T> | null> {
    return (await ContextStore.get<T>(id)) ?? null;
  }

  async update<T = Record<string, unknown>>(id: string, patch: Partial<T>): Promise<boolean> {
    const ctx = await ContextStore.get<T>(id);
    if (!ctx) return false;
    Object.assign(ctx.data as object, patch);
    await ContextStore.set(ctx as SpraxiumContext<unknown>);
    return true;
  }

  async delete(id: string): Promise<void> {
    await ContextStore.delete(id);
  }
}
