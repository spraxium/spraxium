import 'reflect-metadata';
import { GatewayIntentBits, IntentsBitField } from 'discord.js';
import { describe, expect, it } from 'vitest';
import { SpraxiumApplication } from '../src/application/spraxium.application';
import { IntentPreset, resolveIntents } from '../src/client/types';

function clientIntents(app: SpraxiumApplication): IntentsBitField {
  const client = (
    app as unknown as { buildClient(): { options: { intents: IntentsBitField } } }
  ).buildClient();
  return client.options.intents;
}

describe('SpraxiumApplication intents', () => {
  it('passes factory-supplied intents to the Discord client', () => {
    const app = new SpraxiumApplication(
      { intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] },
      Date.now(),
    );

    const intents = clientIntents(app);
    expect(intents.has(GatewayIntentBits.GuildMembers)).toBe(true);
    expect(intents.bitfield).toBe(
      new IntentsBitField([GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]).bitfield,
    );
  });

  it('falls back to the Standard preset when no intents are supplied', () => {
    const app = new SpraxiumApplication({}, Date.now());
    expect(clientIntents(app).bitfield).toBe(
      new IntentsBitField(resolveIntents(IntentPreset.Standard)).bitfield,
    );
  });

  it('addIntents() extends factory-supplied intents instead of the default preset', () => {
    const app = new SpraxiumApplication({ intents: [GatewayIntentBits.Guilds] }, Date.now()).addIntents(
      GatewayIntentBits.MessageContent,
    );
    expect(clientIntents(app).bitfield).toBe(
      new IntentsBitField([GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent]).bitfield,
    );
  });

  it('intents() replaces factory-supplied intents', () => {
    const app = new SpraxiumApplication({ intents: [GatewayIntentBits.GuildMembers] }, Date.now()).intents([
      GatewayIntentBits.Guilds,
    ]);
    const intents = clientIntents(app);
    expect(intents.has(GatewayIntentBits.Guilds)).toBe(true);
    expect(intents.has(GatewayIntentBits.GuildMembers)).toBe(false);
  });
});
