import { Module } from '@spraxium/common';
import { LeaderboardCommand } from './commands/leaderboard.command';
import { LeaderboardCommandHandler } from './handlers/leaderboard-command.handler';
import { PlayerButtonHandler } from './handlers/player-button.handler';

@Module({
  commands: [LeaderboardCommand],
  handlers: [LeaderboardCommandHandler, PlayerButtonHandler],
})
export class LeaderboardModule {}
