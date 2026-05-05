import { SelectOption, StringSelect } from '@spraxium/components';

@StringSelect({
  customId: 'profile_locale_select',
  placeholder: 'Select your preferred locale…',
  minValues: 1,
  maxValues: 1,
  i18n: { placeholder: 'commands.components.profile.select.placeholder' },
})
@SelectOption({
  label: 'English (US)',
  value: 'en-US',
  description: 'Set your language to English',
  emoji: '🇺🇸',
  i18n: {
    label: 'commands.components.profile.options.en_us.label',
    description: 'commands.components.profile.options.en_us.description',
  },
})
@SelectOption({
  label: 'Portuguese (Brazil)',
  value: 'pt-BR',
  description: 'Definir idioma para Português',
  emoji: '🇧🇷',
  i18n: {
    label: 'commands.components.profile.options.pt_br.label',
    description: 'commands.components.profile.options.pt_br.description',
  },
})
export class LocaleSelect {}
