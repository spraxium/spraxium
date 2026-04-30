import { Ctx, SlashCommandHandler } from '@spraxium/common';
import type { ChatInputCommandInteraction } from 'discord.js';
import { DrizzleDemoCommand } from '../commands/drizzle-demo.command';
import { DrizzlePostgresService } from '../services/drizzle-postgres.service';

@SlashCommandHandler(DrizzleDemoCommand, { sub: 'ping' })
export class DrizzlePingHandler {
  constructor(private readonly drizzle: DrizzlePostgresService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const latencyMs = await this.drizzle.ping();
    await interaction.reply(`PostgreSQL online. SELECT 1 executado em ${latencyMs}ms.`);
  }
}
