import { Module } from '@spraxium/common';
import { MessageContextMenuModule } from './modules/message/message.module';
import { UserContextMenuModule } from './modules/user/user.module';

@Module({
  imports: [UserContextMenuModule, MessageContextMenuModule],
})
export class AppModule {}
