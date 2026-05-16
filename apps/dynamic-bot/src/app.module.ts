import { Module } from '@spraxium/common';
import { ComponentsModule } from '@spraxium/components';
import { CatalogModule } from './modules/catalog/catalog.module';
import { ClaimModule } from './modules/claim/claim.module';
import { ErrorsModule } from './modules/errors/errors.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { PanelModule } from './modules/panel/panel.module';
import { QuickActionsModule } from './modules/quick-actions/quick-actions.module';
import { RestyleModule } from './modules/restyle/restyle.module';
import { TaskManagerModule } from './modules/task-manager/task-manager.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { TopicsModule } from './modules/topics/topics.module';
import { WizardModule } from './modules/wizard/wizard.module';

@Module({
  imports: [
    ComponentsModule,
    CatalogModule,
    ClaimModule,
    PanelModule,
    TopicsModule,
    RestyleModule,
    LeaderboardModule,
    QuickActionsModule,
    WizardModule,
    TicketsModule,
    ErrorsModule,
    TaskManagerModule,
  ],
})
export class AppModule {}
