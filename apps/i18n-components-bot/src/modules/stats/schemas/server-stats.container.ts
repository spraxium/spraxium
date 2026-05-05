import { V2Container, V2Section, V2Separator, V2Text, V2When, desc } from '@spraxium/components';

export interface ServerStatsData {
  header: string;
  membersLine: string;
  onlineLine: string;
  boostLevel: number;
  boostLine: string;
  iconUrl: string;
  footer: string;
}

@V2Container({ accentColor: 0x5865f2 })
export class ServerStatsContainer {
  @V2Text((d: ServerStatsData) => desc().h2(d.header))
  title!: never;

  @V2Separator()
  divider!: never;

  @V2Section({
    text: (d: ServerStatsData) => [d.membersLine, d.onlineLine].join('\n'),
    thumbnail: {
      url: (d: ServerStatsData) => d.iconUrl,
      description: 'Guild icon',
    },
  })
  stats!: never;

  @V2When((d: ServerStatsData) => d.boostLevel > 0)
  @V2Text((d: ServerStatsData) => d.boostLine)
  boostInfo!: never;

  @V2Separator({ divider: false })
  spacer!: never;

  @V2Text((d: ServerStatsData) => desc().subtext(d.footer))
  footerText!: never;
}
