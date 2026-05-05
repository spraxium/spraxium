import { IntentPreset, SpraxiumFactory } from '@spraxium/core';
import { EnvValidator } from '@spraxium/env';
import { Logger } from '@spraxium/logger';
import { AppEnv } from './app.env';
import { AppModule } from './app.module';

async function main(): Promise<void> {
  const logger = new Logger('Main');
  const environment = EnvValidator.validate(AppEnv);

  const app = await SpraxiumFactory.create({ token: environment.token });

  app.useModule(AppModule);
  app.provide(AppEnv, environment);
  app.intents(IntentPreset.Standard);

  logger.info('Starting i18n-components-bot...');
  await app.listen();
}

main();
