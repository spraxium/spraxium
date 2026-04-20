import { Events, Listener, Once } from '@spraxium/common';
import { Logger } from '@spraxium/core';
import type { Client } from 'discord.js';

@Listener(Events.ClientReady)
export class ReadyListener {
  private logger: Logger = new Logger(ReadyListener.name);

  @Once()
  onReady(client: Client<true>): void {
    this.logger.info(`Client is ready as ${client.user.tag}`);
  }
}
