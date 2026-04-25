# @spraxium/i18n

`@spraxium/i18n` provides a full internationalization solution for Spraxium bots. Translation files are organized by locale code, loaded through configurable loaders (file system by default), and stored in an in-memory or custom store. The `I18nService` resolves the correct translation string for a given key and locale, handles variable interpolation with a lightweight `{{variable}}` syntax, and delegates plural selection to the native `Intl.PluralRules` API for accurate results across all languages with no additional dependencies.

The package also provides first-class helpers for the Discord localization API: `buildSlashLocalizations`, `buildChoiceLocalizations`, and `buildOptionLocalizations` generate the locale map objects that Discord expects for slash command names and descriptions. `LocalizedEmbedBuilder` extends Discord.js's embed builder to resolve translation keys inline, making it easy to send fully localized responses without manually calling `I18nService` for every field.

## Installation

```bash
npm install @spraxium/i18n
```

## Usage

```typescript
import { Injectable } from '@spraxium/common';
import { I18nService } from '@spraxium/i18n';

@Injectable()
export class GreetService {
  constructor(private readonly i18n: I18nService) {}

  greet(locale: string, name: string): string {
    return this.i18n.t('greet.hello', locale, { name });
  }
}
```

```json
{
  "greet": {
    "hello": "Hello, {{name}}!"
  }
}
```

```typescript
import { Module } from '@spraxium/common';
import { I18nModule } from '@spraxium/i18n';

@Module({
  imports: [
    I18nModule.forRoot({
      defaultLocale: 'en-US',
      fallbackLocale: 'en-US',
    }),
  ],
})
export class AppModule {}
```

## Links

[npm](https://www.npmjs.com/package/@spraxium/i18n) · [GitHub](https://github.com/spraxium/spraxium) · [Discord Locales](https://discord.com/developers/docs/reference#locales) · [Documentation](https://spraxium.com)

## License

Apache 2.0
