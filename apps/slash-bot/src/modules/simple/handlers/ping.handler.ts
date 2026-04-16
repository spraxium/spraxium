import { Ctx, SlashCommandHandler } from '@spraxium/common';
import type { ChatInputCommandInteraction } from 'discord.js';
import { PingCommand } from '../commands/ping.command';

@SlashCommandHandler(PingCommand)
export class PingHandler {
  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const ws = interaction.client.ws.ping;
    await interaction.reply(`🏓 Pong! WebSocket latency: **${ws}ms**.`);
  }
}
