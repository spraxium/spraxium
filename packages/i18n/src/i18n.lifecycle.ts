import { Inject, Injectable, type SpraxiumOnBoot } from '@spraxium/common';
import { ConfigStore, SlashLocalizationBridge, logger } from '@spraxium/core';
import chalk from 'chalk';
import { defineI18n } from './i18n.config';
import { ReferenceLoader } from './loaders/reference-loader';
import { LocaleRegistry } from './registry/locale-registry';
import { PluralResolver } from './resolvers/plural-resolver';
import { I18nService } from './service/i18n.service';
import { I18nStoreRegistry } from './stores/i18n-store.registry';
import { buildSlashLocalizations } from './helpers/slash-localizations';

@Injectable()
export class I18nLifecycle implements SpraxiumOnBoot {
  constructor(@Inject(I18nService) private readonly i18nService: I18nService) {}

  async onBoot(): Promise<void> {
    const config = ConfigStore.getPluginConfig(defineI18n);

    if (!config) {
      logger.debug('i18n plugin not configured , skipping');
      return;
    }

    LocaleRegistry.reset();
    PluralResolver.reset();

    LocaleRegistry.initialize(config.defaultLocale, {});

    if (config.references.length > 0) {
      ReferenceLoader.load(config.references, process.cwd());
    }

    if (config.pluralRules) {
      PluralResolver.setRules(config.pluralRules);
    }

    const store = I18nStoreRegistry.get();
    await store.init();

    this.i18nService.bind(store);

    // Bridge so the slash registrar can call buildSlashLocalizations without importing i18n directly
    SlashLocalizationBridge.setProvider((keys) => buildSlashLocalizations(keys));

    const localeCount = LocaleRegistry.locales().length;
    logger.raw(
      `${chalk.green('✔')}  i18n loaded , ${localeCount} locale(s), default: ${config.defaultLocale}`,
    );
  }
}
