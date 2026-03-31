import type { BanOptions, SerializedBan, SerializedGuild, SerializedMember } from '../types';

export interface BotBridge {
  getGuild(guildId: string): Promise<SerializedGuild | null>;
  getMember(guildId: string, userId: string): Promise<SerializedMember | null>;
  getMembers(guildId: string): Promise<Array<SerializedMember> | null>;
  getBan(guildId: string, userId: string): Promise<SerializedBan | null>;
  getBans(guildId: string): Promise<Array<SerializedBan>>;
  banMember(guildId: string, userId: string, reason: string, options?: BanOptions): Promise<boolean>;
  unbanMember(guildId: string, userId: string): Promise<boolean>;
  kickMember(guildId: string, userId: string, reason: string): Promise<boolean>;
  timeoutMember(guildId: string, userId: string, durationMs: number, reason: string): Promise<boolean>;
  removeTimeoutMember(guildId: string, userId: string): Promise<boolean>;
  addRole(guildId: string, userId: string, roleId: string): Promise<boolean>;
  removeRole(guildId: string, userId: string, roleId: string): Promise<boolean>;
}
