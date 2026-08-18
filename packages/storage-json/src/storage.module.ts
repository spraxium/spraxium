import { Global, Module } from '@spraxium/common';
import { StorageLifecycle } from './runtime/storage.lifecycle';
import { StorageRegistry } from './runtime/storage.registry';
import { StorageService } from './runtime/storage.service';

@Global()
@Module({
  providers: [StorageRegistry, StorageService, StorageLifecycle],
  exports: [StorageService],
})
export class StorageModule {}
