import { Listener, On } from '@spraxium/common';
import {
  CooldownException,
  GuildOnlyException,
  OwnerOnlyException,
  PermissionDeniedException,
  ValidationException,
} from '@spraxium/core';
import { logger } from '@spraxium/logger';
import { Events, type Message } from 'discord.js';
import { AccountSuspendedException } from './account-suspended.exception';

@Listener(Events.MessageCreate)
export class ExceptionsDemoListener {
  private readonly log = logger.child(ExceptionsDemoListener.name);

  @On()
  async onMessage(message: Message): Promise<void> {
    if (message.author.bot) return;
    this.log.info(`Received message: ${message.content}`);
    if (!message.content.startsWith('!ex')) return;

    const [, type] = message.content.split(' ');
    await this.dispatch(type?.trim().toLowerCase(), message);
  }

  private async dispatch(type: string | undefined, message: Message): Promise<void> {
    switch (type) {
      case 'cooldown':
        throw new CooldownException({ seconds: 30 });

      case 'permission':
        throw new PermissionDeniedException({ permission: 'ManageMessages' });

      case 'guild':
        throw new GuildOnlyException();

      case 'owner':
        throw new OwnerOnlyException();

      case 'validation':
        throw new ValidationException({ field: 'amount', reason: 'must be a positive integer' });

      case 'custom':
        throw new AccountSuspendedException({
          reason: 'Spamming commands',
          expiresAt: '2025-12-31',
          caseId: 'CASE-9001',
        });

      case 'unhandled':
        throw new Error('Something unexpected happened inside a command!');

      default:
        await message.reply(
          '**Spraxium Exception Demo**\n' +
            'Usage: `!ex <type>`\n\n' +
            'Types: `cooldown`, `permission`, `guild`, `owner`, `validation`, `custom`, `unhandled`',
        );
    }
  }
}
