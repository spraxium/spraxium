import type { Client } from 'discord.js';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export async function directAddRole(
  client: Client,
  guildId: string,
  userId: string,
  roleId: string,
): Promise<boolean> {
  const member = client.guilds.cache.get(guildId)?.members.cache.get(userId);
  if (!member) return false;
  try {
    await member.roles.add(roleId);
    return true;
  } catch {
    return false;
  }
}

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export async function directRemoveRole(
  client: Client,
  guildId: string,
  userId: string,
  roleId: string,
): Promise<boolean> {
  const member = client.guilds.cache.get(guildId)?.members.cache.get(userId);
  if (!member) return false;
  try {
    await member.roles.remove(roleId);
    return true;
  } catch {
    return false;
  }
}
