import type { APIEmbed } from 'discord.js';

export interface SendableChannel {
  send(opts: { embeds: Array<APIEmbed> }): Promise<unknown>;
}
