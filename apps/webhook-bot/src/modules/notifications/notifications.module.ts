import { Module } from '@spraxium/common';
import { NotificationsService } from './notifications.service';

@Module({
  providers: [NotificationsService],
})
export class NotificationsModule {}
