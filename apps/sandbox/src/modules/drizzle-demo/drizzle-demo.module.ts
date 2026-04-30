import { Module } from '@spraxium/common';
import { DrizzleDemoCommand } from './commands/drizzle-demo.command';
import { DrizzleInsertHandler } from './handlers/drizzle-insert-command.handler';
import { DrizzlePingHandler } from './handlers/drizzle-ping-command.handler';
import { DrizzleRecentHandler } from './handlers/drizzle-recent-command.handler';
import { DrizzleConnectionService } from './services/drizzle-connection.service';
import { DrizzlePostgresService } from './services/drizzle-postgres.service';

@Module({
  providers: [DrizzleConnectionService, DrizzlePostgresService],
  commands: [DrizzleDemoCommand],
  handlers: [DrizzlePingHandler, DrizzleInsertHandler, DrizzleRecentHandler],
})
export class DrizzleDemoModule {}
