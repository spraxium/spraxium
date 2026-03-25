import { GatewayIntentBits } from 'discord.js';
import { ALL_NON_PRIVILEGED_INTENTS, PRIVILEGED_INTENTS } from '../constants';

export enum IntentPreset {
  Minimal = 'minimal',
  Standard = 'standard',
  WithMessageContent = 'with_message_content',
  AllNonPrivileged = 'all_non_privileged',
  All = 'all',
}

export function resolveIntents(preset: IntentPreset): Array<GatewayIntentBits> {
  switch (preset) {
    case IntentPreset.Minimal:
      return [GatewayIntentBits.Guilds];
    case IntentPreset.Standard:
      return [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages];
    case IntentPreset.WithMessageContent:
      return [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent];
    case IntentPreset.AllNonPrivileged:
      return [...ALL_NON_PRIVILEGED_INTENTS];
    case IntentPreset.All:
      return [...ALL_NON_PRIVILEGED_INTENTS, ...PRIVILEGED_INTENTS];
  }
}
