import { Module } from '@spraxium/common';
import { StorageModule } from '@spraxium/storage-json';
import { StorageDemoModule } from './modules/storage-demo/storage-demo.module';

@Module({
  imports: [StorageModule, StorageDemoModule],
})
export class AppModule {}
