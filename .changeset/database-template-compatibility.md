---
"@spraxium/cli": patch
---

Fix database generation for the current stable Prisma, Drizzle, TypeORM, Mongoose and MikroORM releases. Prisma MySQL now uses its required driver adapter, MikroORM includes migration configuration, and Drizzle closes its SQLite connection on shutdown.

The database command also preserves existing environment fields, recognizes defaults when checking for duplicates, and resolves imports for both `src/app.env.ts` and `src/env/app.env.ts`.
