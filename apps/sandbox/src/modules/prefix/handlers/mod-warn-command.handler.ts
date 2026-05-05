import { Ctx, PrefixArg, PrefixCommandHandler, UseGuards } from '@spraxium/common';
import { Logger } from '@spraxium/logger';
import type { Message } from 'discord.js';
import { ModCommand } from '../commands/mod.command';
import { ModeratorGuard } from '../guards/moderator.guard';

@UseGuards(ModeratorGuard)
@PrefixCommandHandler(ModCommand, { subcommand: 'warn' })
export class ModWarnHandler {
  private readonly logger = new Logger(ModWarnHandler.name);

  async handle(
    @Ctx() message: Message,
    @PrefixArg('target') userId: string,
    @PrefixArg('reason') reason: string | undefined,
  ): Promise<void> {
    const reasonText = reason ?? 'No reason provided';
    this.logger.info(`${message.author.tag} warned user ${userId}: ${reasonText}`);
    await message.reply(`⚠️ <@${userId}> has been warned. **Reason:** ${reasonText}`);
  }
}
