import type { ShardingManager } from 'discord.js';
import type { SerializedGuild } from '../../types';

export async function shardedGetGuild(
  manager: ShardingManager,
  guildId: string,
): Promise<SerializedGuild | null> {
  try {
    const results = await manager.broadcastEval(
      async (client, ctx) => {
        const guild = client.guilds.cache.get(ctx.guildId);
        if (!guild) return null;
        return {
          id: guild.id,
          name: guild.name,
          icon: guild.icon,
          memberCount: guild.memberCount,
          ownerId: guild.ownerId,
          createdAt: guild.createdAt.toISOString(),
          features: [...guild.features],
        };
      },
      { context: { guildId } },
    );
    return (results as Array<SerializedGuild | null>).find((r) => r !== null) ?? null;
  } catch {
    return null;
  }
}
