import {
  Colors,
  ColorResolver,
  Embed,
  EmbedColor,
  EmbedDescription,
  EmbedField,
  EmbedFooter,
  EmbedTimestamp,
  EmbedTitle,
  EmbedWhen,
  desc,
  inlineCode,
} from '@spraxium/components';

export interface ServerStatsData {
  ws: number;
  guildCount: number;
  userCount: number;
  guildName: string | null;
  channelCount: number | null;
}

@Embed()
export class ServerStatsEmbed {
  @EmbedTitle('ðŸ¤– Bot Stats')
  title!: never;

  @EmbedColor<ServerStatsData>(d =>
    ColorResolver.step(d.ws, [
      { threshold: 100, color: Colors.Green },
      { threshold: 250, color: Colors.Yellow },
    ], Colors.Red),
  )
  color!: never;

  @EmbedDescription<ServerStatsData>(d =>
    desc()
      .h2('Welcome to the embed demo!')
      .empty()
      .line(`Built with a ${inlineCode('ServerStatsEmbed')} class decorated with ${inlineCode('@Embed')}.`)
      .line(`Color changes based on latency via ${inlineCode('stepColor()')} â€” green < 100ms, yellow < 250ms, red otherwise.`)
      .empty()
      .subtext('The "Current Guild" and "Channels" fields below only appear inside a guild.')
      .build(),
  )
  description!: never;

  @EmbedField<ServerStatsData>({
    name: 'WebSocket Latency',
    value: d => inlineCode(d.ws + ' ms'),
    inline: true,
  })
  ws!: never;

  @EmbedField<ServerStatsData>({
    name: 'Guilds',
    value: d => inlineCode(d.guildCount.toString()),
    inline: true,
  })
  guilds!: never;

  @EmbedField<ServerStatsData>({
    name: 'Cached Users',
    value: d => inlineCode(d.userCount.toString()),
    inline: true,
  })
  users!: never;

  @EmbedWhen<ServerStatsData>(d => d.guildName !== null)
  @EmbedField<ServerStatsData>({
    name: 'Current Guild',
    value: d => d.guildName ?? 'â€”',
    inline: true,
  })
  guildName!: never;

  @EmbedWhen<ServerStatsData>(d => d.channelCount !== null)
  @EmbedField<ServerStatsData>({
    name: 'Channels',
    value: d => inlineCode(String(d.channelCount ?? 0)),
    inline: true,
  })
  channels!: never;

  @EmbedTimestamp()
  timestamp!: never;

  @EmbedFooter('Built with @spraxium/components')
  footer!: never;
}
