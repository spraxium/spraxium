import { Injectable } from '@spraxium/common';
import { Logger } from '@spraxium/core';

import { Client } from 'discord.js';

@Injectable()
export class GuildService {
  private readonly log = new Logger('GuildService');

  constructor(private readonly client: Client) {}

  async getGuildStats(guildId: string) {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) return null;

    return {
      id: guild.id,
      name: guild.name,
      memberCount: guild.memberCount,
      boostLevel: guild.premiumTier,
      boostCount: guild.premiumSubscriptionCount ?? 0,
      createdAt: guild.createdAt.toISOString(),
      channels: guild.channels.cache.size,
      roles: guild.roles.cache.size,
      emojis: guild.emojis.cache.size,
    };
  }

  async getGuildChannels(guildId: string) {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) return null;

    return guild.channels.cache.map((ch) => ({
      id: ch.id,
      name: ch.name,
      type: ch.type,
      position: 'position' in ch ? ch.position : 0,
    }));
  }
}
