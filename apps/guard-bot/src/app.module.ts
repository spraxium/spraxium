import { Module } from '@spraxium/common';
import { ComponentsModule } from '@spraxium/components';
import { VipModule } from './modules/vip/vip.module';

@Module({
  imports: [ComponentsModule, VipModule],
})
export class AppModule {}
