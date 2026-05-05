import { Module } from '@spraxium/common';
import { ComponentsModule } from '@spraxium/components';
import { I18nModule } from '@spraxium/i18n';
import { ProfileModule } from './modules/profile/profile.module';
import { ShowcaseModule } from './modules/showcase/showcase.module';
import { StatsModule } from './modules/stats/stats.module';

@Module({
  imports: [ComponentsModule, I18nModule, ProfileModule, StatsModule, ShowcaseModule],
})
export class AppModule {}
