import {
  ColorResolver,
  Embed,
  EmbedColor,
  EmbedField,
  EmbedTitle,
  inlineCode,
} from '@spraxium/components';

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  wins: number;
  losses: number;
}

function rankMedal(rank: number): string {
  if (rank === 1) return 'ðŸ¥‡';
  if (rank === 2) return 'ðŸ¥ˆ';
  if (rank === 3) return 'ðŸ¥‰';
  return 'ðŸ…';
}

@Embed()
export class LeaderboardEntryEmbed {
  @EmbedTitle<LeaderboardEntry>(d => `${rankMedal(d.rank)} #${d.rank} â€” ${d.username}`)
  _title!: never;

  @EmbedColor<LeaderboardEntry>(d => ColorResolver.rank(d.rank))
  _color!: never;

  @EmbedField<LeaderboardEntry>({
    name: 'Score',
    value: d => inlineCode(d.score.toLocaleString()),
    inline: true,
  })
  score!: never;

  @EmbedField<LeaderboardEntry>({
    name: 'Wins',
    value: d => inlineCode(d.wins.toString()),
    inline: true,
  })
  wins!: never;

  @EmbedField<LeaderboardEntry>({
    name: 'Losses',
    value: d => inlineCode(d.losses.toString()),
    inline: true,
  })
  losses!: never;

  @EmbedField<LeaderboardEntry>({
    name: 'Win Rate',
    value: d => {
      const total = d.wins + d.losses;
      return inlineCode(total === 0 ? '0%' : `${Math.round((d.wins / total) * 100)}%`);
    },
    inline: true,
  })
  winRate!: never;
}
