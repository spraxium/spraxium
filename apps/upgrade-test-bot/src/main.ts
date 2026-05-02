import 'reflect-metadata';
import { IntentPreset, SpraxiumFactory } from '@spraxium/core';
import { EnvValidator } from '@spraxium/env';
import { AppEnv } from './app.env.js';
import { AppModule } from './app.module.js';

async function main(): Promise<void> {
  const environment = EnvValidator.validate(AppEnv);

  const app = await SpraxiumFactory.create({ token: environment.token });
  app.useModule(AppModule);
  app.provide(AppEnv, environment);
  app.intents(IntentPreset.Standard);

  await app.listen();
}

main();
