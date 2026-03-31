import type { ShardingManager } from 'discord.js';

export async function shardedKickMember(
  manager: ShardingManager,
  guildId: string,
  userId: string,
  reason: string,
): Promise<boolean> {
  try {
    const results = await manager.broadcastEval(
      async (client, ctx) => {
        const guild = client.guilds.cache.get(ctx.guildId);
        if (!guild) return false;
        const member = guild.members.cache.get(ctx.userId);
        if (!member) return false;
        try {
          await member.kick(ctx.reason);
          return true;
        } catch {
          return false;
        }
      },
      { context: { guildId, userId, reason } },
    );
    return (results as Array<boolean>).some((r) => r === true);
  } catch {
    return false;
  }
}

export async function shardedTimeoutMember(
  manager: ShardingManager,
  guildId: string,
  userId: string,
  durationMs: number,
  reason: string,
): Promise<boolean> {
  try {
    const results = await manager.broadcastEval(
      async (client, ctx) => {
        const guild = client.guilds.cache.get(ctx.guildId);
        if (!guild) return false;
        const member = guild.members.cache.get(ctx.userId);
        if (!member) return false;
        try {
          await member.timeout(ctx.durationMs, ctx.reason);
          return true;
        } catch {
          return false;
        }
      },
      { context: { guildId, userId, durationMs, reason } },
    );
    return (results as Array<boolean>).some((r) => r === true);
  } catch {
    return false;
  }
}

export async function shardedRemoveTimeoutMember(
  manager: ShardingManager,
  guildId: string,
  userId: string,
): Promise<boolean> {
  try {
    const results = await manager.broadcastEval(
      async (client, ctx) => {
        const guild = client.guilds.cache.get(ctx.guildId);
        if (!guild) return false;
        const member = guild.members.cache.get(ctx.userId);
        if (!member) return false;
        try {
          await member.timeout(null);
          return true;
        } catch {
          return false;
        }
      },
      { context: { guildId, userId } },
    );
    return (results as Array<boolean>).some((r) => r === true);
  } catch {
    return false;
  }
}
