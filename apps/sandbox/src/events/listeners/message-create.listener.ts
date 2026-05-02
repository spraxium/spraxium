import { Listener, On } from '@spraxium/common';
import { Logger } from '@spraxium/logger';
import { Events, type Message } from 'discord.js';

@Listener(Events.MessageCreate)
export class MessageCreateListener {
  private logger: Logger = new Logger(MessageCreateListener.name);

  @On()
  async onMessage(message: Message): Promise<void> {
    this.logger.warn(`Rcebendo mensagem: ${message.content} de ${message.author.tag}`);
    if (message.author.bot) return;
    await message.reply('You have at least 2 roles, so this guard allows you to see this message!');
  }
}
