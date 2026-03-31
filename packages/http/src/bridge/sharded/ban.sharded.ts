import type { ShardingManager } from 'discord.js';
import type { BanOptions, SerializedBan } from '../../types';

export async function shardedGetBan(
  manager: ShardingManager,
  guildId: string,
  userId: string,
): Promise<SerializedBan | null> {
  try {
    const results = await manager.broadcastEval(
      async (client, ctx) => {
        const guild = client.guilds.cache.get(ctx.guildId);
        if (!guild) return null;
        try {
          const ban = await guild.bans.fetch(ctx.userId);
          return {
            user: {
              id: ban.user.id,
              username: ban.user.username,
              discriminator: ban.user.discriminator,
              avatar: ban.user.avatar,
              bot: ban.user.bot,
              createdAt: ban.user.createdAt.toISOString(),
            },
            reason: ban.reason,
          };
        } catch {
          return null;
        }
      },
      { context: { guildId, userId } },
    );
    return (results as Array<SerializedBan | null>).find((r) => r !== null) ?? null;
  } catch {
    return null;
  }
}

export async function shardedGetBans(
  manager: ShardingManager,
  guildId: string,
): Promise<Array<SerializedBan>> {
  try {
    const results = await manager.broadcastEval(
      async (client, ctx) => {
        const guild = client.guilds.cache.get(ctx.guildId);
        if (!guild) return null;
        try {
          const bans = await guild.bans.fetch();
          return [...bans.values()].map((ban) => ({
            user: {
              id: ban.user.id,
              username: ban.user.username,
              discriminator: ban.user.discriminator,
              avatar: ban.user.avatar,
              bot: ban.user.bot,
              createdAt: ban.user.createdAt.toISOString(),
            },
            reason: ban.reason,
          }));
        } catch {
          return null;
        }
      },
      { context: { guildId } },
    );
    return (results as Array<Array<SerializedBan> | null>).find((r) => r !== null) ?? [];
  } catch {
    return [];
  }
}

export async function shardedBanMember(
  manager: ShardingManager,
  guildId: string,
  userId: string,
  reason: string,
  options?: BanOptions,
): Promise<boolean> {
  try {
    const results = await manager.broadcastEval(
      async (client, ctx) => {
        const guild = client.guilds.cache.get(ctx.guildId);
        if (!guild) return false;
        try {
          await guild.members.ban(ctx.userId, {
            reason: ctx.reason,
            deleteMessageSeconds: ctx.deleteMessageSeconds,
          });
          return true;
        } catch {
          return false;
        }
      },
      { context: { guildId, userId, reason, deleteMessageSeconds: options?.deleteMessageSeconds } },
    );
    return (results as Array<boolean>).some((r) => r === true);
  } catch {
    return false;
  }
}

export async function shardedUnbanMember(
  manager: ShardingManager,
  guildId: string,
  userId: string,
): Promise<boolean> {
  try {
    const results = await manager.broadcastEval(
      async (client, ctx) => {
        const guild = client.guilds.cache.get(ctx.guildId);
        if (!guild) return false;
        try {
          await guild.members.unban(ctx.userId);
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
