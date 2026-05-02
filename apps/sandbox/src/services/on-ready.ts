import { Injectable, type SpraxiumOnReady } from '@spraxium/common';
import { Logger } from '@spraxium/logger';
import type { Client } from 'discord.js';

@Injectable()
export class OnReadyService implements SpraxiumOnReady {
  private logger: Logger = new Logger(OnReadyService.name);

  async onReady(client: Client<true>) {
    this.logger.log('nathantgm', `There're one guy in this server called luiz that gives his ass too much`);
  }
}
