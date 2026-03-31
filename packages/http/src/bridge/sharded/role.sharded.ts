import type { ShardingManager } from 'discord.js';

export async function shardedAddRole(
  manager: ShardingManager,
  guildId: string,
  userId: string,
  roleId: string,
): Promise<boolean> {
  try {
    const results = await manager.broadcastEval(
      async (client, ctx) => {
        const guild = client.guilds.cache.get(ctx.guildId);
        if (!guild) return false;
        const member = guild.members.cache.get(ctx.userId);
        if (!member) return false;
        try {
          await member.roles.add(ctx.roleId);
          return true;
        } catch {
          return false;
        }
      },
      { context: { guildId, userId, roleId } },
    );
    return (results as Array<boolean>).some((r) => r === true);
  } catch {
    return false;
  }
}

export async function shardedRemoveRole(
  manager: ShardingManager,
  guildId: string,
  userId: string,
  roleId: string,
): Promise<boolean> {
  try {
    const results = await manager.broadcastEval(
      async (client, ctx) => {
        const guild = client.guilds.cache.get(ctx.guildId);
        if (!guild) return false;
        const member = guild.members.cache.get(ctx.userId);
        if (!member) return false;
        try {
          await member.roles.remove(ctx.roleId);
          return true;
        } catch {
          return false;
        }
      },
      { context: { guildId, userId, roleId } },
    );
    return (results as Array<boolean>).some((r) => r === true);
  } catch {
    return false;
  }
}
