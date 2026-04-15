import { Global, Module } from '@spraxium/common';
import { I18nLifecycle } from './i18n.lifecycle';
import { I18nService } from './service/i18n.service';

@Global()
@Module({
  providers: [I18nService, I18nLifecycle],
  exports: [I18nService],
})
export class I18nModule {}
