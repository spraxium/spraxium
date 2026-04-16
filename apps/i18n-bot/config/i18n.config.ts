import { defineI18n } from '@spraxium/i18n';

export const i18nConfig = defineI18n({
  defaultLocale: 'en-US',
  references: [
    {
      name: 'commands',
      path: './locales',
    },
  ],
});
