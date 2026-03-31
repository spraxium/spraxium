import type { ShardingManager } from 'discord.js';
import { BotBridge } from '../interfaces';
import type { BanOptions, SerializedBan, SerializedGuild, SerializedMember } from '../types';
import { shardedBanMember, shardedGetBan, shardedGetBans, shardedUnbanMember } from './sharded/ban.sharded';
import { shardedGetGuild } from './sharded/guild.sharded';
import { shardedGetMember, shardedGetMembers } from './sharded/member.sharded';
import {
  shardedKickMember,
  shardedRemoveTimeoutMember,
  shardedTimeoutMember,
} from './sharded/moderation.sharded';
import { shardedAddRole, shardedRemoveRole } from './sharded/role.sharded';

export class ShardedBotBridge extends BotBridge {
  constructor(private readonly manager: ShardingManager) {
    super();
  }

  getGuild(guildId: string): Promise<SerializedGuild | null> {
    return shardedGetGuild(this.manager, guildId);
  }

  getMember(guildId: string, userId: string): Promise<SerializedMember | null> {
    return shardedGetMember(this.manager, guildId, userId);
  }

  getMembers(guildId: string): Promise<Array<SerializedMember> | null> {
    return shardedGetMembers(this.manager, guildId);
  }

  getBan(guildId: string, userId: string): Promise<SerializedBan | null> {
    return shardedGetBan(this.manager, guildId, userId);
  }

  getBans(guildId: string): Promise<Array<SerializedBan>> {
    return shardedGetBans(this.manager, guildId);
  }

  banMember(guildId: string, userId: string, reason: string, options?: BanOptions): Promise<boolean> {
    return shardedBanMember(this.manager, guildId, userId, reason, options);
  }

  unbanMember(guildId: string, userId: string): Promise<boolean> {
    return shardedUnbanMember(this.manager, guildId, userId);
  }

  kickMember(guildId: string, userId: string, reason: string): Promise<boolean> {
    return shardedKickMember(this.manager, guildId, userId, reason);
  }

  timeoutMember(guildId: string, userId: string, durationMs: number, reason: string): Promise<boolean> {
    return shardedTimeoutMember(this.manager, guildId, userId, durationMs, reason);
  }

  removeTimeoutMember(guildId: string, userId: string): Promise<boolean> {
    return shardedRemoveTimeoutMember(this.manager, guildId, userId);
  }

  addRole(guildId: string, userId: string, roleId: string): Promise<boolean> {
    return shardedAddRole(this.manager, guildId, userId, roleId);
  }

  removeRole(guildId: string, userId: string, roleId: string): Promise<boolean> {
    return shardedRemoveRole(this.manager, guildId, userId, roleId);
  }
}
