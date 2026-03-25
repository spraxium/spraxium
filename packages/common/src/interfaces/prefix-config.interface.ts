import type { PrefixGuildProvider } from './prefix-guild.interface';

/**
 * Configuration for the prefix command subsystem.
 *
 * Set in `SpraxiumCoreConfig.prefix` or via
 * `SpraxiumFactory.create({ prefix: ... })`.
 */
export interface PrefixConfig {
  /** The global prefix string(s). @default '!' */
  prefix: string | Array<string>;

  /**
   * Async function that supplies initial per-guild prefix data at boot time.
   *
   * The framework calls this once during bootstrap and loads the returned
   * entries into the in-memory `PrefixGuildManager`.
   *
   * After boot, use the `PrefixGuildManager` API to update prefixes at runtime
   * without restarting the bot.
   *
   * @example
   * ```ts
   * guildPrefixProvider: async () => {
   *   const rows = await db.query('SELECT guild_id, prefix FROM settings');
   *   return rows.map(r => ({ guildId: r.guild_id, prefix: r.prefix }));
   * }
   * ```
   */
  guildPrefixProvider?: PrefixGuildProvider;

  /** Whether prefix matching is case-sensitive. @default false */
  caseSensitive?: boolean;

  /** Whether commands should accept a bot mention as a prefix. @default true */
  mentionPrefix?: boolean;

  /** Default cooldown in seconds applied to all commands. @default 0 */
  defaultCooldown?: number;

  /** Whether to reply with "command not found" when no match is found. @default false */
  replyOnNotFound?: boolean;
}
