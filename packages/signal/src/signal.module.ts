import { Global, Module } from '@spraxium/common';
import { NonceCache } from './security';
import { SignalProcessor, SignalRegistry, SignalRouter, SignalValidator } from './services';

@Global()
@Module({
  providers: [NonceCache, SignalValidator, SignalRouter, SignalProcessor, SignalRegistry],
})
export class SignalModule {}
