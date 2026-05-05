import { Module } from '@spraxium/common';
import { GetLinkCommand } from './commands/get-link.command';
import { QuoteCommand } from './commands/quote.command';
import { GetLinkHandler } from './handlers/get-link-command.handler';
import { QuoteHandler } from './handlers/quote-command.handler';

@Module({
  commands: [QuoteCommand, GetLinkCommand],
  handlers: [QuoteHandler, GetLinkHandler],
})
export class MessageContextMenuModule {}
