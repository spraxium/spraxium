import { Module } from '@spraxium/common';
import { SignalModule } from '@spraxium/signal';
import { SignalsModule } from './modules/signals/signals.module';

@Module({
  imports: [SignalModule, SignalsModule],
})
export class AppModule {}
