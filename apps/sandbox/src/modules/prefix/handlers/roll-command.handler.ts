import { Ctx, PrefixArg, PrefixCommandHandler } from '@spraxium/common';
import { Logger } from '@spraxium/core';
import type { Message } from 'discord.js';
import { RollCommand } from '../commands/roll.command';

@PrefixCommandHandler(RollCommand)
export class RollHandler {
  private readonly logger = new Logger(RollHandler.name);

  async handle(
    @Ctx() message: Message,
    @PrefixArg('sides') sides: number | undefined,
    @PrefixArg('count') count: number | undefined,
  ): Promise<void> {
    const faces = sides ?? 6;
    const rolls = count ?? 1;

    const results = Array.from({ length: rolls }, () => Math.floor(Math.random() * faces) + 1);
    const total = results.reduce((a, b) => a + b, 0);

    const rollStr = results.join(', ');
    const summary =
      rolls > 1
        ? `🎲 Rolled **${rolls}d${faces}**: [${rollStr}] → Total: **${total}**`
        : `🎲 Rolled **1d${faces}**: **${results[0]}**`;

    this.logger.debug(`${message.author.tag} rolled ${rolls}d${faces}: [${rollStr}]`);
    await message.reply(summary);
  }
}
