import type {
  APIInteractionGuildMember,
  BaseInteraction,
  GuildMember,
  Message,
  PermissionsBitField,
  User,
} from 'discord.js';

/**
 * Represents whatever triggered the handler , could be an interaction or a message.
 * Passed into every guard's canActivate().
 */
export interface ExecutionContext {
  /** Snowflake ID of the user who triggered the handler. */
  getUserId(): string;

  /** The User object of whoever triggered the handler. */
  getUser(): User;

  /** Snowflake ID of the guild, or null when invoked in a DM. */
  getGuildId(): string | null;

  /** Snowflake ID of the channel where the handler was triggered. */
  getChannelId(): string;

  /** The name of the event/command that was triggered. */
  getCommandName(): string;

  /**
   * The resolved guild member, or null in DMs or when the member is not cached.
   * Works for all interaction types (ChatInput, Button, SelectMenu, Modal, etc.)
   * and for Message-based handlers.
   */
  getMember(): GuildMember | APIInteractionGuildMember | null;

  /**
   * The member's resolved guild permissions, or null in DMs / uncached members.
   * Works for all interaction types and Message-based handlers.
   */
  getMemberPermissions(): Readonly<PermissionsBitField> | null;

  /**
   * The raw BaseInteraction or Message backing this context.
   * Prefer the typed helpers (getMember, getMemberPermissions, getUser) over
   * casting this directly.
   */
  getInteraction(): BaseInteraction | Message;

  /** True when the handler was triggered via a slash (ChatInput) interaction. */
  isSlashCommand(): boolean;

  /** True when the handler was triggered via a text prefix message. */
  isPrefixCommand(): boolean;
}
