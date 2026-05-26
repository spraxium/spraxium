import { Module } from '@spraxium/common';
import { ComponentsModule } from '@spraxium/components';
import { TicketModule } from './modules/ticket/ticket.module';

@Module({
  imports: [ComponentsModule, TicketModule],
})
export class AppModule {}
