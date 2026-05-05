import { Embed, EmbedField } from '@spraxium/components';

export interface AnnounceData {
  version: string;
  package: string;
}

@Embed({
  title: '📢 Announcement',
  description: 'This embed was built with `buildLocalizedEmbed()` from `@spraxium/i18n`.',
  color: 0x57f287,
  footer: { text: 'Powered by @spraxium/i18n' },
  i18n: {
    title: 'commands.components.showcase.embed.title',
    description: 'commands.components.showcase.embed.description',
    footerText: 'commands.components.showcase.embed.footer',
  },
})
export class AnnounceEmbed {
  @EmbedField<AnnounceData>({
    name: 'Version',
    value: (d) => d.version,
    inline: true,
    i18n: { name: 'commands.components.showcase.embed.fields.version.name' },
  })
  version!: never;

  @EmbedField<AnnounceData>({
    name: 'Package',
    value: (d) => d.package,
    inline: true,
    i18n: { name: 'commands.components.showcase.embed.fields.package.name' },
  })
  package!: never;
}
