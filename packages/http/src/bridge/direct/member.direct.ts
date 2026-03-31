import type { Client } from 'discord.js';
import type { SerializedMember } from '../../types';
import { MemberSerializer } from '../serializers/member.serializer';

const memberSerializer = new MemberSerializer();

export async function directGetMember(
  client: Client,
  guildId: string,
  userId: string,
): Promise<SerializedMember | null> {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return null;
  const member = guild.members.cache.get(userId);
  return member ? memberSerializer.serialize(member) : null;
}

export async function directGetMembers(
  client: Client,
  guildId: string,
): Promise<Array<SerializedMember> | null> {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return null;
  return memberSerializer.serializeMany([...guild.members.cache.values()]);
}
