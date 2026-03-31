import type { Client } from 'discord.js';

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
