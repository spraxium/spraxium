import { IntentPreset, Logger, SpraxiumFactory } from '@spraxium/core';
import { EnvValidator } from '@spraxium/env';
import { I18nStoreRegistry } from '@spraxium/i18n';
import { AppEnv } from './app.env';
import { AppModule } from './app.module';
import { DrizzleLocaleStore } from './stores/drizzle.store';

async function main() {
  const logger = new Logger('Main');
  const environment = EnvValidator.validate(AppEnv);
  I18nStoreRegistry.set(new DrizzleLocaleStore(environment.DATABASE_URL));

  const app = await SpraxiumFactory.create({ token: environment.token });

  app.useModule(AppModule);
  app.provide(AppEnv, environment);
  app.intents(IntentPreset.WithMessageContent);

  logger.info('Starting application...');

  app.initPresence({
    activities: [{ name: 'Spraxium', type: 'Playing' }],
  });

  await app.listen();
}

main();
