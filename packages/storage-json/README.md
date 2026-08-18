# @spraxium/storage-json

`@spraxium/storage-json` adds typed, file-backed JSON persistence to Spraxium applications. Stores are discovered from module providers, loaded during boot, validated with Zod, and exposed through an injectable service. Reads use an in-memory snapshot, while writes are serialized per store and committed with a temporary file and rename.

The package supports documents for values that belong together as one JSON object and collections for records addressed by string IDs. It is intended for small and medium datasets owned by a single process. Invalid JSON or schema data stops the application during boot without replacing the original file.

## Installation

```bash
npm install @spraxium/storage-json zod
```

## Usage

```typescript
// spraxium.config.ts
import { defineConfig } from '@spraxium/core';
import { defineStorage } from '@spraxium/storage-json';

export default defineConfig({
  plugins: [
    defineStorage({
      directory: '.spraxium/storage',
    }),
  ],
});
```

```typescript
// settings.storage.ts
import {
  CollectionDefinition,
  DocumentDefinition,
  JsonCollection,
  JsonDocument,
} from '@spraxium/storage-json';
import { z } from 'zod';

const settingsSchema = z.object({
  prefix: z.string().min(1).max(5),
});

export type Settings = z.infer<typeof settingsSchema>;

@JsonDocument({
  name: 'settings',
  defaults: () => ({ prefix: '!' }),
  schema: settingsSchema,
})
export class SettingsDocument extends DocumentDefinition<Settings> {}

const reminderSchema = z.object({
  message: z.string().min(1),
});

export type Reminder = z.infer<typeof reminderSchema>;

@JsonCollection({
  name: 'reminders',
  schema: reminderSchema,
})
export class RemindersCollection extends CollectionDefinition<Reminder> {}
```

```typescript
// settings.module.ts
import { Injectable, Module } from '@spraxium/common';
import {
  type CollectionStore,
  type DocumentStore,
  StorageModule,
  StorageService,
} from '@spraxium/storage-json';
import {
  type Reminder,
  RemindersCollection,
  type Settings,
  SettingsDocument,
} from './settings.storage';

@Injectable()
export class SettingsService {
  private readonly settings: DocumentStore<Settings>;
  private readonly reminders: CollectionStore<Reminder>;

  constructor(storage: StorageService) {
    this.settings = storage.document(SettingsDocument);
    this.reminders = storage.collection(RemindersCollection);
  }

  async setPrefix(prefix: string): Promise<void> {
    await this.settings.update((draft) => {
      draft.prefix = prefix;
    });
  }

  async saveReminder(id: string, message: string): Promise<void> {
    await this.reminders.set(id, { message });
  }
}

@Module({
  imports: [StorageModule],
  providers: [SettingsDocument, RemindersCollection, SettingsService],
})
export class SettingsModule {}
```

Documents provide `read`, `replace`, `update`, and `reset`. Collections provide `get`, `has`, `set`, `update`, `delete`, `keys`, `values`, `entries`, `size`, and `clear`. Read and listing operations return defensive clones, so changes only reach the snapshot and file through a store mutation.

## Links

[npm](https://www.npmjs.com/package/@spraxium/storage-json) · [GitHub](https://github.com/spraxium/spraxium) · [Zod](https://zod.dev) · [Documentation](https://spraxium.com)

## License

Apache 2.0
