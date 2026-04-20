import {
  Colors,
  Embed,
  EmbedColor,
  EmbedDescription,
  EmbedFooter,
  EmbedTitle,
  desc,
  inlineCode,
} from '@spraxium/components';

@Embed()
export class AllSelectTypesEmbed {
  @EmbedTitle('🗂️ All Select Types')
  title!: never;

  @EmbedColor(Colors.Yellow)
  color!: never;

  @EmbedDescription(() =>
    desc()
      .line('All five Discord select menu types available in Spraxium:')
      .empty()
      .line(`• ${inlineCode('@StringSelect')} - custom options list`)
      .line(`• ${inlineCode('@UserSelect')} - server members`)
      .line(`• ${inlineCode('@RoleSelect')} - server roles`)
      .line(`• ${inlineCode('@MentionableSelect')} - users + roles combined`)
      .line(`• ${inlineCode('@ChannelSelect')} - server channels (filterable by type)`)
      .empty()
      .subtext('Each row below corresponds to one select type.')
      .build(),
  )
  description!: never;

  @EmbedFooter('@spraxium/components · SelectService')
  footer!: never;
}
