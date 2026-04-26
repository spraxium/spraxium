import { Module } from '@spraxium/common';
import { WebhookModule } from '@spraxium/webhook';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [WebhookModule, NotificationsModule, ReportsModule],
})
export class AppModule {}
