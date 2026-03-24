/**
 * A single guild's prefix configuration, returned by a
 * `PrefixGuildProvider` during bootstrap or at runtime.
 */
export interface PrefixGuildEntry {
  /** Discord guild (server) snowflake ID. */
  guildId: string;

  /** One or more prefixes active for this guild. */
  prefix: string | Array<string>;

  /** Arbitrary metadata the developer can attach (e.g. language, tier). */
  metadata?: Record<string, unknown>;
}

/**
 * Async function that supplies initial per-guild prefix data at boot time.
 *
 * The framework calls this once during bootstrap and loads the returned
 * entries into the in-memory `PrefixGuildManager`. The developer can
 * source this data from a database, API, or any async store.
 *
 * @example
 * ```ts
 * const provider: PrefixGuildProvider = async () => {
 *   const rows = await db.query('SELECT guild_id, prefix FROM guild_settings');
 *   return rows.map(r => ({ guildId: r.guild_id, prefix: r.prefix }));
 * };
 * ```
 */
export type PrefixGuildProvider = () => Promise<Array<PrefixGuildEntry>> | Array<PrefixGuildEntry>;
