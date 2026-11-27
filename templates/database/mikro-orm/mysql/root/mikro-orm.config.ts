import { Migrator } from '@mikro-orm/migrations';
import { defineConfig } from '@mikro-orm/mysql';
import { loadEnv } from '@spraxium/env';
import { User } from './src/modules/{{MODULE_NAME}}/entities/user.entity';

loadEnv();

export default defineConfig({
  clientUrl: process.env.DATABASE_URL,
  entities: [User],
  extensions: [Migrator],
  migrations: {
    path: './migrations',
    pathTs: './migrations',
  },
});
