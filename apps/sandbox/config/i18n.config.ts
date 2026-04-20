import { defineI18n } from '@spraxium/i18n';

export const i18nConfig = defineI18n({
  defaultLocale: 'en-US',
  references: [
    {
      name: 'commands',
      path: './locales',
    },
  ],
    pluralRules: {
    'pt-BR': (count) => count === 1 ? 'one' : 'other',
    'ar': (count) => {
      if (count === 0) return 'zero';
      if (count === 1) return 'one';
      if (count === 2) return 'two';
      if (count % 100 >= 3 && count % 100 <= 10) return 'few';
      if (count % 100 >= 11 && count % 100 <= 99) return 'many';
      return 'other';
    },
  }
});
