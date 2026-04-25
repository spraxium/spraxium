# @spraxium/core

`@spraxium/core` is the runtime engine of every Spraxium application. It contains the application factory (`SpraxiumFactory`), the dependency injection container (`SpraxiumContainer`), the module loader, lifecycle hooks, and the full slash command and prefix command pipelines. When you call `SpraxiumFactory.create`, the core package resolves the entire module graph, instantiates all providers in dependency order, registers slash commands with the Discord API, and attaches the event listeners that drive the bot.

The package also provides the guard pipeline for authorizing incoming interactions, a structured logger (`SpraxiumLogger`) with configurable transports, a typed exception system with built-in fallback error handlers, and internal utility helpers shared across the framework. Application code typically interacts with the decorators from `@spraxium/common` rather than calling `@spraxium/core` directly, but the core package is the right place to look when extending the framework or building advanced integrations.

## Installation

```bash
npm install @spraxium/core
```

## Usage

```typescript
import { SpraxiumFactory } from '@spraxium/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await SpraxiumFactory.create(AppModule);
  await app.listen();
}

bootstrap();
```

```typescript
import { Module } from '@spraxium/common';
import { PingModule } from './ping/ping.module';

@Module({
  imports: [PingModule],
})
export class AppModule {}
```

## Links

[npm](https://www.npmjs.com/package/@spraxium/core) · [GitHub](https://github.com/spraxium/spraxium) · [Documentation](https://spraxium.com)

## License

Apache 2.0
