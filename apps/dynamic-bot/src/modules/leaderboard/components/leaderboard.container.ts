import {
  V2Container,
  V2Dynamic,
  V2DynamicRow,
  V2Separator,
  V2Text,
  desc,
  v2text,
} from '@spraxium/components';
import type { LeaderboardData, Player } from '../leaderboard.data';
import { PlayerButton } from './player-button.component';

const MEDALS = ['🥇', '🥈', '🥉'];

@V2Container({ accentColor: 0x5865f2 })
export class LeaderboardContainer {
  @V2Text((data: LeaderboardData) => desc().h2(`🏆 ${data.title}`))
  title!: never;

  @V2Separator()
  divider!: never;

  @V2Dynamic((data: LeaderboardData) =>
    data.players.map((p, i) =>
      v2text(`${MEDALS[i] ?? `**${i + 1}.**`} **${p.name}**: ${p.score.toLocaleString()} pts`),
    ),
  )
  rows!: never;

  @V2Separator({ divider: false })
  spacer!: never;

  @V2Text(desc().subtext('Click a player to view details: buttons auto-chunked into rows of 5.'))
  hint!: never;

  @V2DynamicRow({ dynamic: PlayerButton, items: (data: LeaderboardData) => data.players })
  playerButtons!: never;
}
