import { Module } from '@spraxium/common';
import { DrizzleDemoCommand } from './commands/drizzle-demo.command';
import { DrizzleInsertHandler } from './handlers/drizzle-insert.handler';
import { DrizzlePingHandler } from './handlers/drizzle-ping.handler';
import { DrizzleRecentHandler } from './handlers/drizzle-recent.handler';
import { DrizzleConnectionService } from './services/drizzle-connection.service';
import { DrizzlePostgresService } from './services/drizzle-postgres.service';

@Module({
  providers: [DrizzleConnectionService, DrizzlePostgresService],
  commands: [DrizzleDemoCommand],
  handlers: [DrizzlePingHandler, DrizzleInsertHandler, DrizzleRecentHandler],
})
export class DrizzleDemoModule {}
