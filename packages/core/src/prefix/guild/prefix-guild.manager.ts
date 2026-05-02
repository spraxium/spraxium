import type { PrefixGuildEntry, PrefixGuildProvider } from '@spraxium/common';
import { logger } from '@spraxium/logger';
import { PREFIX_MESSAGES } from '../constants';

/**
 * Manages per-guild prefix overrides at runtime.
 *
 * During bootstrap, the framework loads initial data via a
 * `PrefixGuildProvider` if one is configured. After boot, use the
 * mutation API (`set`, `update`, `remove`) to change prefixes
 * dynamically , no restart required.
 *
 * The `PrefixParser` reads from this manager on every message to
 * determine the active prefix for a guild.
 */
export class PrefixGuildManager {
  private readonly log = logger.child('PrefixGuildManager');
  private readonly store = new Map<string, PrefixGuildEntry>();

  public getGuildPrefix(guildId: string): Array<string> | undefined {
    const entry = this.store.get(guildId);
    if (!entry) return undefined;
    return Array.isArray(entry.prefix) ? entry.prefix : [entry.prefix];
  }

  public getGuildEntry(guildId: string): Readonly<PrefixGuildEntry> | undefined {
    return this.store.get(guildId);
  }

  public hasGuildPrefix(guildId: string): boolean {
    return this.store.has(guildId);
  }

  public getAllGuildIds(): Array<string> {
    return Array.from(this.store.keys());
  }

  public get size(): number {
    return this.store.size;
  }

  public setGuildPrefix(
    guildId: string,
    prefix: string | Array<string>,
    metadata?: Record<string, unknown>,
  ): void {
    this.store.set(guildId, { guildId, prefix, metadata });
  }

  public updateGuildPrefix(
    guildId: string,
    prefix: string | Array<string>,
    metadata?: Record<string, unknown>,
  ): void {
    const existing = this.store.get(guildId);
    this.store.set(guildId, {
      guildId,
      prefix,
      metadata: { ...existing?.metadata, ...metadata },
    });
  }

  public removeGuildPrefix(guildId: string): boolean {
    return this.store.delete(guildId);
  }

  public clear(): void {
    this.store.clear();
  }

  public async loadFromProvider(provider: PrefixGuildProvider): Promise<void> {
    const entries = await provider();

    for (const entry of entries) {
      this.store.set(entry.guildId, entry);
    }

    this.log.debug(PREFIX_MESSAGES.guildLoaded(entries.length));
  }
}
