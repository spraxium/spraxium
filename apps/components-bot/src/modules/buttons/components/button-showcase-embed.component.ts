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
export class ButtonShowcaseEmbed {
  @EmbedTitle('🔘 Button Showcase')
  title!: never;

  @EmbedColor(Colors.Blue)
  color!: never;

  @EmbedDescription(() =>
    desc()
      .line('All button styles available in Spraxium:')
      .empty()
      .line(`• ${inlineCode('primary')} - blurple (default)`)
      .line(`• ${inlineCode('secondary')} - grey`)
      .line(`• ${inlineCode('success')} - green`)
      .line(`• ${inlineCode('danger')} - red`)
      .line(`• ${inlineCode('link')} - grey with URL icon (never fires events)`)
      .line(`• ${inlineCode('disabled')} - any style can be disabled`)
      .empty()
      .subtext('Click any active button to see the handler respond.')
      .build(),
  )
  description!: never;

  @EmbedFooter('@spraxium/components · ButtonService')
  footer!: never;
}
