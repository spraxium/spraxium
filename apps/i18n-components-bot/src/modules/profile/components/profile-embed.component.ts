import { Embed, EmbedField } from '@spraxium/components';

export interface ProfileData {
  username: string;
  locale: string;
  joined: string;
}

@Embed({
  title: 'Your Profile',
  description: 'Here is your current profile. Click **Edit** to update your details.',
  color: 0x5865f2,
  footer: { text: 'Use /profile edit to change your info' },
  i18n: {
    title: 'commands.components.profile.embed.title',
    description: 'commands.components.profile.embed.description',
    footerText: 'commands.components.profile.embed.footer',
  },
})
export class ProfileEmbed {
  @EmbedField<ProfileData>({
    name: 'Username',
    value: (d) => d.username,
    inline: true,
    i18n: { name: 'commands.components.profile.fields.username.name' },
  })
  username!: never;

  @EmbedField<ProfileData>({
    name: 'Locale',
    value: (d) => d.locale,
    inline: true,
    i18n: { name: 'commands.components.profile.fields.locale.name' },
  })
  locale!: never;

  @EmbedField<ProfileData>({
    name: 'Member since',
    value: (d) => d.joined,
    inline: true,
    i18n: { name: 'commands.components.profile.fields.joined.name' },
  })
  joined!: never;
}
