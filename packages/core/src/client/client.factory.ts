import { Client, type Partials } from 'discord.js';
import type { SpraxiumOptions } from '../application/interfaces';
import { DEFAULT_PARTIALS } from './constants';
import { IntentPreset, resolveIntents } from './types';

export class ClientFactory {
  static create(options: SpraxiumOptions): Client {
    const intents = options.intents ?? resolveIntents(IntentPreset.Standard);
    const partials = [...new Set<Partials>([...DEFAULT_PARTIALS, ...(options.partials ?? [])])];

    return new Client({
      ...options.clientOptions,
      intents,
      partials,
    });
  }
}
