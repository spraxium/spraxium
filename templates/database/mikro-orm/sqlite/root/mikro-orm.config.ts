import { Migrator } from '@mikro-orm/migrations';
import { defineConfig } from '@mikro-orm/sqlite';
import { loadEnv } from '@spraxium/env';
import { User } from './src/modules/{{MODULE_NAME}}/entities/user.entity';

loadEnv();

export default defineConfig({
  dbName: process.env.DATABASE_PATH ?? './dev.db',
  entities: [User],
  extensions: [Migrator],
  migrations: {
    path: './migrations',
    pathTs: './migrations',
  },
});
