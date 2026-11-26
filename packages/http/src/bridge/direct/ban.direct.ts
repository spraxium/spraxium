import type { Client } from 'discord.js';
import type { BanOptions, SerializedBan } from '../../types';
import { BanSerializer } from '../serializers/ban.serializer';

const banSerializer = new BanSerializer();

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export async function directGetBan(
  client: Client,
  guildId: string,
  userId: string,
): Promise<SerializedBan | null> {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return null;
  try {
    const ban = await guild.bans.fetch(userId);
    return banSerializer.serialize(ban);
  } catch {
    return null;
  }
}

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export async function directGetBans(client: Client, guildId: string): Promise<Array<SerializedBan>> {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return [];
  try {
    const bans = await guild.bans.fetch();
    return banSerializer.serializeMany([...bans.values()]);
  } catch {
    return [];
  }
}

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export async function directBanMember(
  client: Client,
  guildId: string,
  userId: string,
  reason: string,
  options?: BanOptions,
): Promise<boolean> {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return false;
  try {
    await guild.members.ban(userId, { reason, deleteMessageSeconds: options?.deleteMessageSeconds });
    return true;
  } catch {
    return false;
  }
}

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export async function directUnbanMember(client: Client, guildId: string, userId: string): Promise<boolean> {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return false;
  try {
    await guild.members.unban(userId);
    return true;
  } catch {
    return false;
  }
}
