import { GuildOnly, GuardRegistry, IntentPreset, Logger, SpraxiumFactory } from '@spraxium/core';
import { EnvValidator } from '@spraxium/env';
import { AppEnv } from './app.env';
import { AppModule } from './app.module';

async function main(): Promise<void> {
  const logger = new Logger('Main');
  const environment = EnvValidator.validate(AppEnv);

  /**
   * GuardRegistry.register() adds a guard that runs BEFORE every handler
   * across the entire bot — slash commands, context menus, listeners,
   * AND component handlers (buttons, selects, modals).
   *
   * Here we block DMs globally so no handler ever runs outside a guild.
   * This fires on every interaction regardless of type, because every
   * ExecutionContext (SpraxiumExecutionContext OR ComponentExecutionContext)
   * implements the same getGuildId() method.
   */
  GuardRegistry.register(GuildOnly);

  const app = await SpraxiumFactory.create({ token: environment.token });

  app.useModule(AppModule);
  app.provide(AppEnv, environment);
  app.intents(IntentPreset.Standard);

  logger.info('Starting guard-bot...');
  await app.listen();
}

main();
