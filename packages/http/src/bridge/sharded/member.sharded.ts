import type { ShardingManager } from 'discord.js';
import type { SerializedMember, SerializedRole } from '../../types';

export async function shardedGetMember(
  manager: ShardingManager,
  guildId: string,
  userId: string,
): Promise<SerializedMember | null> {
  try {
    const results = await manager.broadcastEval(
      async (client, ctx) => {
        const guild = client.guilds.cache.get(ctx.guildId);
        if (!guild) return null;
        const member = guild.members.cache.get(ctx.userId);
        if (!member) return null;
        return {
          id: member.id,
          username: member.user.username,
          displayName: member.displayName,
          discriminator: member.user.discriminator,
          avatar: member.avatar ?? member.user.avatar,
          bot: member.user.bot,
          joinedAt: member.joinedAt?.toISOString() ?? null,
          createdAt: member.user.createdAt.toISOString(),
          roles: [...member.roles.cache.values()].map((r) => ({
            id: r.id,
            name: r.name,
            color: r.hexColor,
            position: r.position,
            permissions: r.permissions.bitfield.toString(),
            managed: r.managed,
            mentionable: r.mentionable,
          })) as Array<SerializedRole>,
          pending: member.pending,
          communicationDisabledUntil:
            member.communicationDisabledUntilTimestamp != null
              ? new Date(member.communicationDisabledUntilTimestamp).toISOString()
              : null,
        };
      },
      { context: { guildId, userId } },
    );
    return (results as Array<SerializedMember | null>).find((r) => r !== null) ?? null;
  } catch {
    return null;
  }
}

export async function shardedGetMembers(
  manager: ShardingManager,
  guildId: string,
): Promise<Array<SerializedMember> | null> {
  try {
    const results = await manager.broadcastEval(
      async (client, ctx) => {
        const guild = client.guilds.cache.get(ctx.guildId);
        if (!guild) return null;
        return [...guild.members.cache.values()].map((member) => ({
          id: member.id,
          username: member.user.username,
          displayName: member.displayName,
          discriminator: member.user.discriminator,
          avatar: member.avatar ?? member.user.avatar,
          bot: member.user.bot,
          joinedAt: member.joinedAt?.toISOString() ?? null,
          createdAt: member.user.createdAt.toISOString(),
          roles: [...member.roles.cache.values()].map((r) => ({
            id: r.id,
            name: r.name,
            color: r.hexColor,
            position: r.position,
            permissions: r.permissions.bitfield.toString(),
            managed: r.managed,
            mentionable: r.mentionable,
          })),
          pending: member.pending,
          communicationDisabledUntil:
            member.communicationDisabledUntilTimestamp != null
              ? new Date(member.communicationDisabledUntilTimestamp).toISOString()
              : null,
        }));
      },
      { context: { guildId } },
    );
    return (results as Array<Array<SerializedMember> | null>).find((r) => r !== null) ?? null;
  } catch {
    return null;
  }
}
