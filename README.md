<p align="center">
  <img src=".github/assets/spraxium-logo.png" alt="Spraxium" height="100" />
</p>

<p align="center">
  A modular TypeScript framework for Discord bots that need room to grow.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/typescript-5.7-3178c6?style=flat-square" alt="TypeScript" />
  <img src="https://img.shields.io/badge/discord.js-14-5865f2?style=flat-square" alt="discord.js" />
  <img src="https://img.shields.io/badge/license-Apache_2.0-green?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/node-22%20%7C%2024%20%7C%2026-339933?style=flat-square" alt="Node.js" />
</p>

> [!IMPORTANT]
> Spraxium has not reached `1.0.0` yet. We are still refining APIs, testing new ideas, and making changes that will help the framework stay reliable in the long run. The current releases are stable and already recommended for use, but breaking changes and unexpected bugs may still appear while the project is under active development.

## What is Spraxium?

Spraxium sits on top of discord.js and brings modules, dependency injection, decorators, and lifecycle hooks to Discord bot development. It is meant for bots that have outgrown a collection of event handlers but do not need a pile of custom infrastructure.

The framework gives each feature a clear place. Modules keep related code together, services can depend on one another without manual setup, and optional packages cover common needs such as scheduled jobs, translations, HTTP APIs, components, and webhooks.

You only install the packages your bot uses. Configuration lives in a typed `spraxium.config.ts` file, while discord.js remains available whenever you need to work with it directly.

## Architecture

A Spraxium application is made of modules. Each module declares its providers, and the framework resolves their dependencies when the application starts. Lifecycle hooks such as `onBoot`, `onReady`, and `onShutdown` let services react to the application and Discord client state without putting everything in the entry file.

Packages such as `@spraxium/http` and `@spraxium/schedule` plug into the same configuration layer through their own `define*` helpers. This keeps setup in one place and lets TypeScript catch configuration mistakes early.

## Example Apps

Runnable examples live in [apps/](./apps/). They are also used to test how the packages work together, so they are a good reference when a feature needs more context than a short documentation snippet can provide.

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
| `@spraxium/logger` | Centralized structured logging system with table-based output and configurable transports |
| `@spraxium/webhook` | Decorator-based Discord webhook management with a rich send API for embeds and message components |
| `@spraxium/cli` | Project scaffolding, module generation, and developer tooling via the `spraxium` CLI |

## Sharding

Spraxium supports Discord sharding through `ShardingManager`. When sharding is enabled, `@spraxium/http` runs the HTTP server in the manager process and communicates with the shards through its bridge layer. API consumers still get one view of the bot, regardless of which shard owns the requested data.

## Requirements

- Node.js 22.23.2+, 24.19.0+, or 26.7.0+ within the respective major release line
- TypeScript 5.7 or newer
- discord.js 14
- `experimentalDecorators` and `emitDecoratorMetadata` enabled in `tsconfig.json`

## Feedback and bug reports

Spraxium is developed in the open. If something behaves unexpectedly, please [open an issue](https://github.com/spraxium/spraxium/issues) with a small reproduction when possible. Real-world reports are especially helpful while we work toward `1.0.0`.

## License

Apache 2.0, see [LICENSE](./LICENSE).

<p align="center">
  Built by <a href="https://github.com/spacelaxy"><img src=".github/assets/spacelaxy_logo.jpg" alt="Spacelaxy" height="20" style="vertical-align:middle;" /></a> <strong>Spacelaxy</strong>
</p>
