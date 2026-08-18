# Spraxium Storage Bot

Executable example for `@spraxium/storage-json`. It demonstrates the complete framework integration:

- `StorageModule` and `defineStorage()`;
- a typed `@JsonDocument()` with default data and a native Zod schema;
- a typed `@JsonCollection()` with seeded defaults and per-entry Zod validation;
- normal constructor injection through `StorageService`;
- boot lifecycle updates;
- document `read`, `update`, `replace`, and `reset`;
- collection `get`, `has`, `set`, `update`, `delete`, `entries`, `size`, and `clear`;
- persisted data surviving bot restarts.

## Run

Copy `.env.example` to `.env`, add a Discord bot token, then run from the repository root:

```bash
pnpm --filter @spraxium/storage-bot dev
```

By default, data is written to `.spraxium/storage-demo/`. `demo-stats` uses the explicit path override in `spraxium.config.ts`, while `demo-notes` uses the configured directory and becomes `demo-notes.json`.

## Commands

- `/storage status` — reads the document and collection size.
- `/storage save` — creates or updates a collection entry.
- `/storage get` — reads an entry and atomically increments its read counter.
- `/storage remove` — deletes an entry.
- `/storage list` — enumerates entries.
- `/storage reset` — resets the document and clears the collection.

The document also increments `bootCount` on every application boot, making restart persistence immediately visible.
