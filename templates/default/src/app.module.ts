import { Module } from '@spraxium/common';
import { DefaultModule } from './modules/default/default.module';

@Module({
  imports: [DefaultModule],
})
export class AppModule {}
