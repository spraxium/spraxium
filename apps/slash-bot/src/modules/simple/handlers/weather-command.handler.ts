import { AutoDefer, Ctx, SlashCommandHandler } from '@spraxium/common';
import type { ChatInputCommandInteraction } from 'discord.js';
import { WeatherCommand } from '../commands/weather.command';

/**
 * Responds in ~200 ms -- well within the 2000 ms threshold.
 * AutoDefer never fires the timer, so Discord shows no "Thinking..." state.
 * The handler calls interaction.reply() as usual.
 */
@SlashCommandHandler(WeatherCommand)
@AutoDefer({ ephemeral: false, threshold: 2000 })
export class WeatherHandler {
  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    // Simulates a fast cache lookup (~200 ms)
    await new Promise((resolve) => setTimeout(resolve, 200));

    await interaction.reply(
      '🌤️ Current weather: **22°C**, partly cloudy. Wind: 14 km/h NW. ' +
        '*(responded in ~200 ms -- no defer was needed)*',
    );
  }
}
