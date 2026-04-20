import {
  Colors,
  Embed,
  EmbedColor,
  EmbedDescription,
  EmbedField,
  EmbedFooter,
  EmbedTimestamp,
  EmbedTitle,
  desc,
  inlineCode,
} from '@spraxium/components';

@Embed()
export class TicketPanelEmbed {
  @EmbedTitle('ðŸŽ« Support Ticket Panel')
  title!: never;

  @EmbedColor(Colors.Blue)
  color!: never;

  @EmbedDescription(() =>
    desc()
      .line('Need help? Open a ticket below to get in touch with our support team.')
      .empty()
      .line(`1. **Select a category** using the dropdown menu`)
      .line(`2. Click ${inlineCode('Open Ticket')} to create a new ticket`)
      .line(`3. Or click ${inlineCode('Docs')} to browse the documentation`)
      .empty()
      .subtext('Our average response time is under 5 minutes.')
      .build(),
  )
  description!: never;

  @EmbedFooter('Spraxium Support System')
  footer!: never;

  @EmbedTimestamp(true)
  timestamp!: never;
}

@Embed()
export class ButtonShowcaseEmbed {
  @EmbedTitle('ðŸ”˜ Button Showcase')
  title!: never;

  @EmbedColor(0x5865f2)
  color!: never;

  @EmbedDescription(() =>
    desc()
      .line('All button styles available in the framework:')
      .empty()
      .line(`â€¢ ${inlineCode('primary')} â€” blurple (default)`)
      .line(`â€¢ ${inlineCode('secondary')} â€” grey`)
      .line(`â€¢ ${inlineCode('success')} â€” green`)
      .line(`â€¢ ${inlineCode('danger')} â€” red`)
      .line(`â€¢ ${inlineCode('link')} â€” grey with URL icon (never fires events)`)
      .line(`â€¢ ${inlineCode('disabled')} â€” any style can be disabled`)
      .build(),
  )
  description!: never;
}

export interface SelectShowcaseData {
  guildName: string;
  memberCount: number;
}

@Embed()
export class SelectShowcaseEmbed {
  @EmbedTitle('ðŸ“‹ Select Menu Showcase')
  title!: never;

  @EmbedColor(Colors.Green)
  color!: never;

  @EmbedDescription(() =>
    desc()
      .line('All five select menu types demonstrated below:')
      .empty()
      .line(`â€¢ ${inlineCode('@StringSelect')} â€” custom options with emoji & descriptions`)
      .line(`â€¢ ${inlineCode('@UserSelect')} â€” auto-populates with server members`)
      .line(`â€¢ ${inlineCode('@RoleSelect')} â€” auto-populates with server roles`)
      .line(`â€¢ ${inlineCode('@MentionableSelect')} â€” users + roles combined`)
      .line(`â€¢ ${inlineCode('@ChannelSelect')} â€” auto-populates with channels (filterable)`)
      .build(),
  )
  description!: never;

  @EmbedField<SelectShowcaseData>({
    name: 'Server',
    value: (d) => d.guildName,
    inline: true,
  })
  guild!: never;

  @EmbedField<SelectShowcaseData>({
    name: 'Members',
    value: (d) => inlineCode(d.memberCount.toString()),
    inline: true,
  })
  members!: never;

  @EmbedFooter('Try clicking any of the selects below!')
  footer!: never;
}
