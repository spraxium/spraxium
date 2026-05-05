# @spraxium/common

`@spraxium/common` is the foundational layer of the Spraxium framework, providing the decorators, interfaces, and types that all other packages depend on. It defines the module system (`@Module`, `@Global`), the dependency injection primitives (`@Injectable`, `@Inject`, `@Optional`), and the Discord event listener machinery (`@Listener`, `@On`, `@Once`). Every Spraxium application imports from this package, whether directly from application code or transitively through `@spraxium/core`.

Beyond the core DI system, `@spraxium/common` exports the full set of command decorators for both slash and prefix commands, guard decorators for access control, and the `@Ctx` parameter decorator for reading Discord interaction data inside handlers. Keeping all of these in a single shared package ensures that typed objects such as command metadata and guard interfaces are identical across packages with no risk of version drift.

## Installation

```bash
npm install @spraxium/common
```

## Usage

```typescript
import { Module, Injectable, SlashCommand, SlashCommandHandler, Ctx } from '@spraxium/common';
import type { ChatInputCommandInteraction } from 'discord.js';

@Injectable()
export class PingService {
  ping(): string {
    return 'Pong!';
  }
}

@SlashCommand({ name: 'ping', description: 'Replies with pong' })
export class PingCommand {
  constructor(private readonly pingService: PingService) {}

  @SlashCommandHandler()
  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply(this.pingService.ping());
  }
}

@Module({
  providers: [PingService],
  commands: [PingCommand],
})
export class PingModule {}
```

## Links

[npm](https://www.npmjs.com/package/@spraxium/common) · [GitHub](https://github.com/spraxium/spraxium) · [Documentation](https://spraxium.com)

## License

Apache 2.0
