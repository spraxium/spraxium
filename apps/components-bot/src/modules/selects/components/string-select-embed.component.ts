import {
  Colors,
  Embed,
  EmbedColor,
  EmbedDescription,
  EmbedFooter,
  EmbedTitle,
  desc,
} from '@spraxium/components';

@Embed()
export class StringSelectEmbed {
  @EmbedTitle('📋 Select Menu Demo')
  title!: never;

  @EmbedColor(Colors.Green)
  color!: never;

  @EmbedDescription(() =>
    desc()
      .line('Pick one of the options below and the handler will echo your selection back.')
      .empty()
      .subtext('Powered by @StringSelect + @StringSelectHandler')
      .build(),
  )
  description!: never;

  @EmbedFooter('@spraxium/components · SelectService')
  footer!: never;
}
