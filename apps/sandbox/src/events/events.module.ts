import { Module } from '@spraxium/common';
import { MemberJoinListener, MemberLeaveListener } from './listeners/member.listener';
import { MessageCreateListener } from './listeners/message-create.listener';
import { ReadyListener } from './listeners/ready.listener';

@Module({
  listeners: [ReadyListener, MessageCreateListener, MemberJoinListener, MemberLeaveListener],
})
export class EventsModule {}
