import { IntentPreset, SpraxiumFactory } from '@spraxium/core';
import { EnvValidator } from '@spraxium/env';
import { AppEnv } from './app.env';
import { AppModule } from './app.module';

async function main(): Promise<void> {
  const env = EnvValidator.validate(AppEnv);
  const app = await SpraxiumFactory.create({ token: env.token });

  app.useModule(AppModule);
  app.intents(IntentPreset.Standard);

  await app.listen();
}

main();
