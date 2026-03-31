import type { Client } from 'discord.js';
import type { SerializedGuild } from '../../types';
import { GuildSerializer } from '../serializers/guild.serializer';

const guildSerializer = new GuildSerializer();

export async function directGetGuild(client: Client, guildId: string): Promise<SerializedGuild | null> {
  const guild = client.guilds.cache.get(guildId);
  return guild ? guildSerializer.serialize(guild) : null;
}
