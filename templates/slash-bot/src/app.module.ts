import { Module } from '@spraxium/common';
import { PingModule } from './modules/ping/ping.module';

@Module({
  imports: [PingModule],
})
export class AppModule {}
