import { Module } from '@spraxium/common';
import { DemoCommand } from './commands/demo.command';
import { I18nShowcaseCommand } from './commands/i18n-showcase.command';
import { DemoEmbedHandler } from './handlers/demo-embed-command.handler';
import { DemoLocaleHandler } from './handlers/demo-locale-command.handler';
import { DemoPluralHandler } from './handlers/demo-plural-command.handler';
import { DemoRegistryHandler } from './handlers/demo-registry-command.handler';
import { DemoSlashInfoHandler } from './handlers/demo-slash-info-command.handler';
import { DemoTranslateHandler } from './handlers/demo-translate-command.handler';
import { I18nShowcaseOverviewHandler } from './handlers/i18n-showcase-overview-command.handler';
import { I18nShowcaseStoreHandler } from './handlers/i18n-showcase-store-command.handler';

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
