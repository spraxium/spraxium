import type { ExecutionContext } from '@spraxium/common';
import type {
  APIInteractionGuildMember,
  BaseInteraction,
  GuildMember,
  PermissionsBitField,
  User,
} from 'discord.js';

export class ComponentExecutionContext implements ExecutionContext {
  constructor(
    private readonly raw: BaseInteraction,
    private readonly componentId: string,
  ) {}

  public getUserId(): string {
    return this.raw.user.id;
  }

  public getUser(): User {
    return this.raw.user;
  }

  public getGuildId(): string | null {
    return this.raw.guildId;
  }

  public getChannelId(): string {
    // biome-ignore lint/style/noNonNullAssertion: channelId is always present on Discord.js interactions
    return this.raw.channelId!;
  }

  public getCommandName(): string {
    return this.componentId;
  }

  public getMember(): GuildMember | APIInteractionGuildMember | null {
    return (this.raw.member as GuildMember | APIInteractionGuildMember | null) ?? null;
  }

  public getMemberPermissions(): Readonly<PermissionsBitField> | null {
    return this.raw.memberPermissions ?? null;
  }

  public getInteraction(): BaseInteraction {
    return this.raw;
  }

  public isSlashCommand(): boolean {
    return false;
  }

  public isPrefixCommand(): boolean {
    return false;
  }
}
