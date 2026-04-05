import { Module } from '@spraxium/common';
import { LocaleCommand } from './commands/locale.command';
import { LocaleInfoHandler } from './handlers/locale-info-command.handler';
import { LocaleSetHandler } from './handlers/locale-set-command.handler';

@Module({
  commands: [LocaleCommand],
  handlers: [LocaleSetHandler, LocaleInfoHandler],
})
export class LocaleModule {}
