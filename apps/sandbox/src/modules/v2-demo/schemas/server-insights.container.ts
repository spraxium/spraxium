import {
  LinkButton,
  V2Container,
  V2Row,
  V2Section,
  V2Separator,
  V2Text,
  V2When,
  desc,
} from '@spraxium/components';
import { V2DocsLinkButton } from './actions';
import { DocsLinkButton } from '../../component-demo/schemas/buttons';

export interface ServerInsightsData {
  guildName: string;
  memberCount: number;
  onlineCount: number;
  boostLevel: number;
  iconUrl: string;
}

@V2Container({ accentColor: 0x5865f2 })
export class ServerInsightsContainer {
  @V2Text((data: ServerInsightsData) => desc().h2(`📊 ${data.guildName}`))
  title!: never;

  @V2Separator()
  divider!: never;

  @V2Section({
    text: (data: ServerInsightsData) =>
      [
        `👥 **Members:** ${data.memberCount.toLocaleString()}`,
        `🟢 **Online:** ${data.onlineCount.toLocaleString()}`,
      ].join('\n'),
    thumbnail: {
      url: (data: ServerInsightsData) => data.iconUrl,
      description: 'Guild icon',
    },
  })
  stats!: never;

  @V2Section({
    text: "adkasnmkdasmkldmaskldmaskldmaskldmaskldmakl mdklasm kldasmlk dmaskld maklsmdklas",
    button: DocsLinkButton
  })
  adasdaa!: never;

  @V2When((data: ServerInsightsData) => data.boostLevel > 0)
  @V2Text((data: ServerInsightsData) => `⭐ **Boost level:** ${data.boostLevel}`)
  boostInfo!: never;

  @V2Separator({ divider: false })
  spacer!: never;

  @V2Row({ components: [V2DocsLinkButton] })
  docsRow!: never;
}
