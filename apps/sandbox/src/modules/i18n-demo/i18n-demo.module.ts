import { Module } from '@spraxium/common';
import { DemoCommand } from './commands/demo.command';
import { I18nShowcaseCommand } from './commands/i18n-showcase.command';
import { DemoEmbedHandler } from './handlers/demo-embed.handler';
import { DemoLocaleHandler } from './handlers/demo-locale.handler';
import { DemoPluralHandler } from './handlers/demo-plural.handler';
import { DemoRegistryHandler } from './handlers/demo-registry.handler';
import { DemoSlashInfoHandler } from './handlers/demo-slash-info.handler';
import { DemoTranslateHandler } from './handlers/demo-translate.handler';
import { I18nShowcaseOverviewHandler } from './handlers/i18n-showcase-overview.handler';
import { I18nShowcaseStoreHandler } from './handlers/i18n-showcase-store.handler';

@Module({
  commands: [DemoCommand, I18nShowcaseCommand],
  handlers: [
    DemoTranslateHandler,
    DemoPluralHandler,
    DemoLocaleHandler,
    DemoEmbedHandler,
    DemoRegistryHandler,
    DemoSlashInfoHandler,
    I18nShowcaseOverviewHandler,
    I18nShowcaseStoreHandler,
  ],
})
export class I18nDemoModule {}
