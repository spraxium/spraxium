import type { Client } from 'discord.js';
import type { BotBridge } from '../interfaces';
import type { BanOptions, SerializedBan, SerializedGuild, SerializedMember } from '../types';
import { directBanMember, directGetBan, directGetBans, directUnbanMember } from './direct/ban.direct';
import { directGetGuild } from './direct/guild.direct';
import { directGetMember, directGetMembers } from './direct/member.direct';
import { directKickMember, directRemoveTimeoutMember, directTimeoutMember } from './direct/moderation.direct';
import { directAddRole, directRemoveRole } from './direct/role.direct';

export class DirectBotBridge implements BotBridge {
  constructor(private readonly client: Client) {}

  getGuild(guildId: string): Promise<SerializedGuild | null> {
    return directGetGuild(this.client, guildId);
  }

  getMember(guildId: string, userId: string): Promise<SerializedMember | null> {
    return directGetMember(this.client, guildId, userId);
  }

  getMembers(guildId: string): Promise<Array<SerializedMember> | null> {
    return directGetMembers(this.client, guildId);
  }

  getBan(guildId: string, userId: string): Promise<SerializedBan | null> {
    return directGetBan(this.client, guildId, userId);
  }

  getBans(guildId: string): Promise<Array<SerializedBan>> {
    return directGetBans(this.client, guildId);
  }

  banMember(guildId: string, userId: string, reason: string, options?: BanOptions): Promise<boolean> {
    return directBanMember(this.client, guildId, userId, reason, options);
  }

  unbanMember(guildId: string, userId: string): Promise<boolean> {
    return directUnbanMember(this.client, guildId, userId);
  }

  kickMember(guildId: string, userId: string, reason: string): Promise<boolean> {
    return directKickMember(this.client, guildId, userId, reason);
  }

  timeoutMember(guildId: string, userId: string, durationMs: number, reason: string): Promise<boolean> {
    return directTimeoutMember(this.client, guildId, userId, durationMs, reason);
  }

  removeTimeoutMember(guildId: string, userId: string): Promise<boolean> {
    return directRemoveTimeoutMember(this.client, guildId, userId);
  }

  addRole(guildId: string, userId: string, roleId: string): Promise<boolean> {
    return directAddRole(this.client, guildId, userId, roleId);
  }

  removeRole(guildId: string, userId: string, roleId: string): Promise<boolean> {
    return directRemoveRole(this.client, guildId, userId, roleId);
  }
}
