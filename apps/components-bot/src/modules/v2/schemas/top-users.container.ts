import { V2Container, V2Dynamic, V2Separator, V2Text, desc, v2sep, v2text } from '@spraxium/components';

export interface TopUserEntry {
  username: string;
  score: number;
  delta: number;
}

export interface TopUsersData {
  title: string;
  entries: Array<TopUserEntry>;
}

const MEDALS = ['🥇', '🥈', '🥉'];

@V2Container({ accentColor: 0xf1c40f })
export class TopUsersContainer {
  @V2Text((data: TopUsersData) => desc().h2(`🏆 ${data.title}`))
  title!: never;

  @V2Separator()
  divider!: never;

  @V2Dynamic((data: TopUsersData) => {
    if (data.entries.length === 0) {
      return [v2text(desc().subtext('No entries yet.'))];
    }

    return data.entries.flatMap((entry, index) => {
      const medal = MEDALS[index] ?? `**${index + 1}.**`;
      const delta =
        entry.delta > 0 ? `+${entry.delta}` : entry.delta < 0 ? `${entry.delta}` : '0';

      return [
        v2text(`${medal} **${entry.username}** - ${entry.score.toLocaleString()} pts (${delta})`),
        ...(index < data.entries.length - 1 ? [v2sep({ divider: false })] : []),
      ];
    });
  })
  entries!: never;

  @V2Separator({ divider: false })
  footerSpacer!: never;

  @V2Text((data: TopUsersData) => desc().subtext(`${data.entries.length} players ranked`))
  summary!: never;
}
