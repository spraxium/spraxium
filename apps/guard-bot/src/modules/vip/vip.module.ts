import { Module } from '@spraxium/common';
import { ButtonService } from '@spraxium/components';
import { VipCommand } from './commands/vip.command';
import { VipClaimButtonHandler } from './handlers/vip-claim-button.handler';
import { VipCommandHandler } from './handlers/vip-command.handler';

@Module({
  providers: [ButtonService],
  commands: [VipCommand],
  handlers: [VipCommandHandler, VipClaimButtonHandler],
})
export class VipModule {}
