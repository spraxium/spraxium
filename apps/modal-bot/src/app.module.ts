import { Module } from '@spraxium/common';
import { ComponentsModule } from '@spraxium/components';
import { ProfileModule } from './modules/profile/profile.module';
import { SuggestionModule } from './modules/suggestion/suggestion.module';
import { TicketModule } from './modules/ticket/ticket.module';

@Module({
  imports: [ComponentsModule, TicketModule, ProfileModule, SuggestionModule],
})
export class AppModule {}
