import { Module } from '@spraxium/common';
import { AvatarCommand } from './commands/avatar.command';
import { UserInfoCommand } from './commands/user-info.command';
import { AvatarHandler } from './handlers/avatar-command.handler';
import { UserInfoHandler } from './handlers/user-info-command.handler';

@Module({
  commands: [UserInfoCommand, AvatarCommand],
  handlers: [UserInfoHandler, AvatarHandler],
})
export class UserContextMenuModule {}
