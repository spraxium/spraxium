import { Module } from "@spraxium/common";
import { ComponentsModule } from "@spraxium/components";
import { HttpModule } from "@spraxium/http";
import { ScheduleModule } from "@spraxium/schedule";
import { I18nModule } from "@spraxium/i18n";
import { EventsModule } from "./events/events.module";
import { ExceptionsModule } from "./exceptions/exceptions.module";
import { EmbedDemoModule } from "./modules/embed-demo/embed-demo.module";
import { FlowContextDemoModule } from "./modules/flow-context-demo/flow-context-demo.module";
import { ModalDemoModule } from "./modules/modal-demo/modal-demo.module";
import { ComponentDemoModule } from "./modules/component-demo/component-demo.module";
import { V2DemoModule } from "./modules/v2-demo/v2-demo.module";
import { I18nDemoModule } from "./modules/i18n-demo/i18n-demo.module";
import { PrefixModule } from "./modules/prefix/prefix.module";
import { SlashModule } from "./modules/slash/slash.module";
import { DrizzleDemoModule } from "./modules/drizzle-demo/drizzle-demo.module";
import { LeaderboardService } from "./services/leaderboard.service";
import { PresenceService } from "./services/presence.service";
import { ReminderService } from "./services/reminder.service";
import { TasksService } from "./services/tasks.service";
import { DatabaseModule } from './modules/database/database.module';

@Module({
  imports: [
    ComponentsModule,
    ScheduleModule,
    I18nModule,
    HttpModule,
    ExceptionsModule,
    EventsModule,
    PrefixModule,
    SlashModule,
    DrizzleDemoModule,
    I18nDemoModule,
    EmbedDemoModule,
    ModalDemoModule,
    ComponentDemoModule,
    V2DemoModule,
    FlowContextDemoModule,
    DatabaseModule,
  ],
  providers: [
    TasksService,
    PresenceService,
    LeaderboardService,
    ReminderService,
  ],
  exports: [LeaderboardService],
})
export class AppModule {}
