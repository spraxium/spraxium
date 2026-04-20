import {
  V2Container,
  V2Section,
  V2Separator,
  V2Text,
  V2When,
  desc,
} from '@spraxium/components';

export interface ServerStatsData {
  guildName: string;
  memberCount: number;
  onlineCount: number;
  boostLevel: number;
  iconUrl: string;
}

@V2Container({ accentColor: 0x5865f2 })
export class ServerStatsContainer {
  @V2Text((data: ServerStatsData) => desc().h2(`📊 ${data.guildName}`))
  title!: never;

  @V2Separator()
  divider!: never;

  @V2Section({
    text: (data: ServerStatsData) =>
      [
        `👥 **Members:** ${data.memberCount.toLocaleString()}`,
        `🟢 **Online:** ${data.onlineCount.toLocaleString()}`,
      ].join('\n'),
    thumbnail: {
      url: (data: ServerStatsData) => data.iconUrl,
      description: 'Guild icon',
    },
  })
  stats!: never;

  @V2When((data: ServerStatsData) => data.boostLevel > 0)
  @V2Text((data: ServerStatsData) => `⭐ **Boost level:** ${data.boostLevel}`)
  boostInfo!: never;

  @V2Separator({ divider: false })
  spacer!: never;

  @V2Text((_: ServerStatsData) => desc().subtext('Built with V2 schema class via @spraxium/components'))
  footer!: never;
}
