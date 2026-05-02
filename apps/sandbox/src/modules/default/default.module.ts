import { Module } from '@spraxium/common';
import { DefaultUserService } from './services/default-user.service';
import { UserSyncTask } from './tasks/user-sync.task';
import { Logger } from '@spraxium/logger';

@Module({
  imports: [],
  providers: [DefaultUserService, UserSyncTask],
  listeners: [],
})
export class DefaultModule {}
