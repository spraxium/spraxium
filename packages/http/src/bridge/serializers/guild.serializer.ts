import type { Guild } from 'discord.js';
import type { SerializedGuild } from '../../types';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export class GuildSerializer {
  serialize(guild: Guild): SerializedGuild {
    return {
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
      memberCount: guild.memberCount,
      ownerId: guild.ownerId,
      createdAt: guild.createdAt.toISOString(),
      features: [...guild.features],
    };
  }
}
