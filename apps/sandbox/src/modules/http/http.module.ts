import {
  HttpClientModule,
  LoggerMiddleware,
  RateLimitMiddleware,
} from '@spraxium/http';
import { GuildController } from './controllers/guild.controller';
import { LeaderboardController } from './controllers/leaderboard.controller';
import { MemberController } from './controllers/member.controller';
import { GuildService } from './services/guild.service';
import { LeaderboardHttpService } from './services/leaderboard-http.service';

@HttpClientModule({
  services: [
    LeaderboardHttpService,
    GuildService
  ],
  controllers: [
    GuildController,
    MemberController,
    LeaderboardController
  ],
  middleware: [
    new LoggerMiddleware(),
    new RateLimitMiddleware({ windowMs: 60_000, max: 100 }),
  ],
})
export class SandboxHttpModule {}
