import type { BanOptions, SerializedBan, SerializedGuild, SerializedMember } from '../types';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export abstract class BotBridge {
  abstract getGuild(guildId: string): Promise<SerializedGuild | null>;
  abstract getMember(guildId: string, userId: string): Promise<SerializedMember | null>;
  abstract getMembers(guildId: string): Promise<Array<SerializedMember> | null>;
  abstract getBan(guildId: string, userId: string): Promise<SerializedBan | null>;
  abstract getBans(guildId: string): Promise<Array<SerializedBan>>;
  abstract banMember(guildId: string, userId: string, reason: string, options?: BanOptions): Promise<boolean>;
  abstract unbanMember(guildId: string, userId: string): Promise<boolean>;
  abstract kickMember(guildId: string, userId: string, reason: string): Promise<boolean>;
  abstract timeoutMember(
    guildId: string,
    userId: string,
    durationMs: number,
    reason: string,
  ): Promise<boolean>;
  abstract removeTimeoutMember(guildId: string, userId: string): Promise<boolean>;
  abstract addRole(guildId: string, userId: string, roleId: string): Promise<boolean>;
  abstract removeRole(guildId: string, userId: string, roleId: string): Promise<boolean>;
}
