import type { Client } from 'discord.js';
import type { SerializedGuild } from '../../types';
import { GuildSerializer } from '../serializers/guild.serializer';

const guildSerializer = new GuildSerializer();

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export async function directGetGuild(client: Client, guildId: string): Promise<SerializedGuild | null> {
  const guild = client.guilds.cache.get(guildId);
  return guild ? guildSerializer.serialize(guild) : null;
}
