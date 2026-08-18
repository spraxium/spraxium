import { Module } from '@spraxium/common';
import { StorageCommand } from './commands/storage.command';
import {
  StorageGetHandler,
  StorageListHandler,
  StorageRemoveHandler,
  StorageResetHandler,
  StorageSaveHandler,
  StorageStatusHandler,
} from './handlers/storage.handlers';
import { StorageDemoService } from './services/storage-demo.service';
import { DemoNotesCollection } from './storage/demo-notes.collection';
import { DemoStatsDocument } from './storage/demo-stats.document';

@Module({
  providers: [DemoStatsDocument, DemoNotesCollection, StorageDemoService],
  commands: [StorageCommand],
  handlers: [
    StorageStatusHandler,
    StorageSaveHandler,
    StorageGetHandler,
    StorageRemoveHandler,
    StorageListHandler,
    StorageResetHandler,
  ],
})
export class StorageDemoModule {}
