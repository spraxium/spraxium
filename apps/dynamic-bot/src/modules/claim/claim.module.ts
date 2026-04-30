import { Module } from '@spraxium/common';
import { ClaimCommand } from './commands/claim.command';
import { ClaimRewardButtonHandler } from './handlers/claim-button.handler';
import { ClaimCommandHandler } from './handlers/claim-command.handler';

@Module({
  commands: [ClaimCommand],
  handlers: [ClaimCommandHandler, ClaimRewardButtonHandler],
})
export class ClaimModule {}
