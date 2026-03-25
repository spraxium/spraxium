import type { ExecutionContext } from '@spraxium/common';
import type {
  APIInteractionGuildMember,
  BaseInteraction,
  GuildMember,
  Message,
  PermissionsBitField,
  User,
} from 'discord.js';

/**
 * Concrete implementation of ExecutionContext built from any Discord.js
 * BaseInteraction (slash command, button, select menu, modal, context menu…)
 * or a raw Message (prefix/listener commands).
 */
export class SpraxiumExecutionContext implements ExecutionContext {
  constructor(
    private readonly raw: BaseInteraction | Message,
    private readonly commandName: string,
  ) {}

  public getUserId(): string {
    if ('user' in this.raw) return (this.raw as BaseInteraction).user.id;
    return (this.raw as Message).author.id;
  }

  public getUser(): User {
    if ('user' in this.raw) return (this.raw as BaseInteraction).user;
    return (this.raw as Message).author;
  }

  public getGuildId(): string | null {
    return this.raw.guildId;
  }

  public getChannelId(): string {
    // biome-ignore lint/style/noNonNullAssertion: channelId is always present on Discord.js messages and interactions
    return this.raw.channelId!;
  }

  public getCommandName(): string {
    return this.commandName;
  }

  public getMember(): GuildMember | APIInteractionGuildMember | null {
    const raw = this.raw as { member?: GuildMember | APIInteractionGuildMember | null };
    return raw.member ?? null;
  }

  public getMemberPermissions(): Readonly<PermissionsBitField> | null {
    // BaseInteraction subclasses expose .memberPermissions directly
    if ('memberPermissions' in this.raw) {
      return (this.raw as BaseInteraction).memberPermissions ?? null;
    }
    // Message exposes permissions via .member.permissions
    return (this.raw as Message).member?.permissions ?? null;
  }

  public getInteraction(): BaseInteraction | Message {
    return this.raw;
  }

  public isSlashCommand(): boolean {
    return (
      'isChatInputCommand' in this.raw &&
      typeof (this.raw as { isChatInputCommand: unknown }).isChatInputCommand === 'function' &&
      (this.raw as { isChatInputCommand: () => boolean }).isChatInputCommand()
    );
  }

  public isPrefixCommand(): boolean {
    // Messages do not carry Discord's interaction methods
    return !('isChatInputCommand' in this.raw);
  }
}
