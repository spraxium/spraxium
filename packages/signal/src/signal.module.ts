import { Global, Module } from '@spraxium/common';
import { NonceCache } from './security/nonce-cache.service';
import { RedisNonceStoreFactory } from './security/redis-nonce-store.factory';
import { SignalProcessor, SignalRegistry, SignalRouter, SignalValidator } from './service';

@Global()
@Module({
  providers: [
    RedisNonceStoreFactory,
    NonceCache,
    SignalValidator,
    SignalRouter,
    SignalProcessor,
    SignalRegistry,
  ],
})
export class SignalModule {}
