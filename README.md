<p align="center">
  <img src=".github/assets/spraxium-logo.png" alt="Spraxium" height="100" />
</p>

<p align="center">
  A TypeScript framework for building production-grade Discord bots.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/typescript-5.7-3178c6?style=flat-square" alt="TypeScript" />
  <img src="https://img.shields.io/badge/discord.js-14-5865f2?style=flat-square" alt="discord.js" />
  <img src="https://img.shields.io/badge/license-Apache_2.0-green?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/node-20+-339933?style=flat-square" alt="Node.js" />
</p>

## What is Spraxium

Spraxium is a modular TypeScript framework built on top of discord.js. It applies the same architectural patterns found in backend frameworks, such as dependency injection, decorator-based routing, and lifecycle hooks, to Discord bot development.

Most bots become hard to maintain as they grow. Spraxium gives you a structured foundation from day one: modules group related functionality, services are injected where needed, and concerns like scheduling, internationalization, and HTTP APIs are handled by purpose-built packages that integrate into the application lifecycle without any manual wiring.

The framework is a monorepo of opt-in packages. You include only what your bot needs and configure everything through a single typed file. There is no hidden runtime magic; every behavior is explicit and traceable.

## Architecture

A Spraxium application is composed of modules. Each module declares its providers and the framework resolves the dependency graph at boot time, instantiating services in the correct order. Lifecycle hooks (`onBoot`, `onReady`, `onShutdown`) give each service a well-defined entry point tied to the Discord client connection state.

Packages like `@spraxium/http` or `@spraxium/schedule` plug into the config layer via a `define*` function in `spraxium.config.ts`. This keeps configuration co-located and type-safe without requiring separate bootstrap code.

## Example Apps

The repository includes runnable example apps in [apps/](./apps/). These are the same code examples we use locally to validate package behavior and integration flows. If the documentation is not enough for a specific scenario, start from one of these apps as a base and adapt it to your project.

## Packages

| Package | Description |
|---|---|
| `@spraxium/core` | Application factory, DI container, lifecycle hooks, and the slash and prefix command pipeline |
| `@spraxium/common` | Shared decorators (`@Injectable`, `@Module`, `@Global`) and base interfaces used across all packages |
| `@spraxium/components` | Decorator-based system for Discord UI components: buttons, select menus, modals, embeds, and V2 container layouts |
| `@spraxium/http` | Decorator-based REST API layer over Hono that exposes bot state through a secured HTTP interface with guards, rate limiting, and CORS |
| `@spraxium/i18n` | Internationalization with variable interpolation, plural resolution via `Intl.PluralRules`, and locale fallback |
| `@spraxium/schedule` | Cron-based job scheduler with an optional Redis driver for distributed and sharded environments |
| `@spraxium/signal` | Async unidirectional event signals dispatched through Discord webhooks with schema validation |
| `@spraxium/signal-client` | Lightweight envelope builder for the signal protocol with zero external dependencies, usable outside a Spraxium application |
| `@spraxium/env` | Typed environment variable validation with clear errors at startup |
| `@spraxium/cli` | Project scaffolding, module generation, and developer tooling via the `spraxium` CLI |

## Sharding

Spraxium has first-class support for Discord sharding. The `@spraxium/http` package integrates with `ShardingManager` directly. When sharding is enabled, the HTTP server boots on the manager process and communicates with individual shards through the bridge layer, giving API consumers a unified view of bot state regardless of shard topology.

## Requirements

Node.js 20 or higher, TypeScript 5.7 or higher, discord.js 14, and `experimentalDecorators` with `emitDecoratorMetadata` enabled in `tsconfig.json`.

## License

Apache 2.0, see [LICENSE](./LICENSE).

<p align="center">
  Built by <a href="https://github.com/spacelaxy"><img src=".github/assets/spacelaxy_logo.jpg" alt="Spacelaxy" height="20" style="vertical-align:middle;" /></a> <strong>Spacelaxy</strong>
</p>