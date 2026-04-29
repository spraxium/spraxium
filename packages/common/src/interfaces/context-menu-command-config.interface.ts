/**
 * Type of context menu command exposed by Discord.
 *
 * - `'user'` — appears under right-click on a user (`Apps` submenu)
 * - `'message'` — appears under right-click on a message (`Apps` submenu)
 */
export type ContextMenuCommandType = 'user' | 'message';

export interface ContextMenuCommandConfig {
  /**
   * Display name shown to the user inside the `Apps` submenu.
   * Up to 32 characters; spaces are allowed (unlike slash command names).
   */
  name: string;

  /**
   * Whether this is a user-targeted or message-targeted context menu command.
   */
  type: ContextMenuCommandType;

  /**
   * If set, the command is registered as a guild command in this guild
   * instead of globally. Useful for testing.
   */
  guild?: string;

  /**
   * Whether the command is allowed in DMs. Defaults to `true`.
   * Ignored for context menu commands targeted at messages in DMs.
   */
  dmPermission?: boolean;

  /**
   * Discord permissions required by default to invoke this command.
   * Server admins can override this in guild settings.
   */
  defaultMemberPermissions?: bigint | number | null;

  /**
   * Marks the command as NSFW. Discord will hide it from age-restricted users
   * outside age-gated channels.
   */
  nsfw?: boolean;
}
