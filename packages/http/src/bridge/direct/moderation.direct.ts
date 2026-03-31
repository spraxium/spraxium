import type { Client } from 'discord.js';

export async function directKickMember(
  client: Client,
  guildId: string,
  userId: string,
  reason: string,
): Promise<boolean> {
  const member = client.guilds.cache.get(guildId)?.members.cache.get(userId);
  if (!member) return false;
  try {
    await member.kick(reason);
    return true;
  } catch {
    return false;
  }
}

export async function directTimeoutMember(
  client: Client,
  guildId: string,
  userId: string,
  durationMs: number,
  reason: string,
): Promise<boolean> {
  const member = client.guilds.cache.get(guildId)?.members.cache.get(userId);
  if (!member) return false;
  try {
    await member.timeout(durationMs, reason);
    return true;
  } catch {
    return false;
  }
}

export async function directRemoveTimeoutMember(
  client: Client,
  guildId: string,
  userId: string,
): Promise<boolean> {
  const member = client.guilds.cache.get(guildId)?.members.cache.get(userId);
  if (!member) return false;
  try {
    await member.timeout(null);
    return true;
  } catch {
    return false;
  }
}
