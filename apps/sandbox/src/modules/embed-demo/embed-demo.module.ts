import { Module } from '@spraxium/common';
import { EmbedService } from '@spraxium/components';
import { EmbedDemoCommand } from './commands/embed-demo.command';
import { EmbedDemoBuildHandler } from './handlers/embed-demo-build.handler';
import { EmbedDemoDataHandler } from './handlers/embed-demo-data.handler';
import { EmbedDemoPaginatorHandler } from './handlers/embed-demo-paginator.handler';

@Module({
  providers: [EmbedService],
  commands: [EmbedDemoCommand],
  handlers: [
    EmbedDemoBuildHandler,
    EmbedDemoPaginatorHandler,
    EmbedDemoDataHandler,
  ],
})
export class EmbedDemoModule {}
