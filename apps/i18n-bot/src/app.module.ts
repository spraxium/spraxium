import { Module } from '@spraxium/common';
import { I18nModule } from '@spraxium/i18n';
import { GreetModule } from './modules/greet/greet.module';
import { LocaleModule } from './modules/locale/locale.module';

@Module({
  imports: [I18nModule, GreetModule, LocaleModule],
})
export class AppModule {}
