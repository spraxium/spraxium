export const PREFIX_MESSAGES = {
  // --- Parser type names (used as `expected` in ArgumentException) ---
  boolean: 'boolean (true/false/yes/no/1/0)',
  color: 'hex color (#FF0000 or FF0000)',
  userMention: 'user mention',
  memberMention: 'member mention',
  channelMention: 'channel mention',
  roleMention: 'role mention',
  snowflake: 'snowflake (17-20 digit ID)',
  duration: 'duration (e.g. 5m, 1h30m, 2d)',
  emoji: 'emoji (custom or unicode)',
  integer: 'integer',
  number: 'number',
  url: 'valid URL',
  rest: 'rest (one or more words)',

  // --- Dynamic expected messages ---
  stringMin: (min: number): string => `at least ${min} characters`,
  stringMax: (max: number): string => `at most ${max} characters`,
  restMax: (max: number): string => `rest (max ${max} chars)`,
  boundsMin: (min: number): string => `>= ${min}`,
  boundsMax: (max: number): string => `<= ${max}`,
  choices: (opts: ReadonlyArray<string>): string => `one of [${opts.join(', ')}]`,
  patternMatch: (source: string): string => `match ${source}`,

  // --- Log messages ---
  guildLoaded: (count: number): string => `[PrefixGuildManager] Loaded ${count} guild prefix entries`,
  binderBound: (count: number): string => `[PrefixBinder] Bound messageCreate handler (${count} handlers)`,
};
