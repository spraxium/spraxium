<p align="center">
  <img src=".github/assets/spraxium-logo.png" alt="Spraxium" height="72" />
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

---

## What is Spraxium

Spraxium is a modular TypeScript framework built on top of discord.js. It brings the same architectural patterns used in server-side frameworks dependency injection, decorator-based routing, lifecycle hooks, and a plugin system to Discord bot development.

Most Discord bots grow into unmaintainable scripts as complexity increases. Spraxium addresses this by providing a structured foundation from the start: modules group related functionality, services are injected where needed, and cross-cutting concerns like scheduling, internationalization, and HTTP APIs are handled by dedicated packages that integrate directly into the application lifecycle.

The framework is organized as a monorepo of opt-in packages. You pull in only what your bot actually needs and configure everything through a single typed config file. There is no runtime magic, every behavior is explicit and traceable.

---

## Architecture

A Spraxium application is composed of modules. Each module declares its providers and the framework resolves the dependency graph at boot time, instantiating services in the correct order. Lifecycle hooks (`onBoot`, `onReady`, `onShutdown`) give each service a well-defined entry point tied to the Discord client's state.

The plugin system extends the config layer: packages like `@spraxium/http` or `@spraxium/schedule` are activated by calling their `define*` function in `spraxium.config.ts`. This keeps configuration co-located and type-safe without requiring any manual wiring.

---

## Packages

| Package | Description |
|---|---|
| `@spraxium/core` | Application factory, DI container, lifecycle hooks, slash and prefix command pipeline |
| `@spraxium/common` | Shared decorators (`@Injectable`, `@Module`, `@Global`) and base interfaces used across all packages |
| `@spraxium/http` | Decorator-based REST API over Hono — exposes bot state via a secured HTTP layer with guards, rate limiting, and CORS |
| `@spraxium/i18n` | Internationalization with variable interpolation, plural resolution via `Intl.PluralRules`, and locale fallback |
| `@spraxium/schedule` | Cron-based job scheduler with an optional Redis driver for distributed and sharded environments |
| `@spraxium/signal` | Async unidirectional event signals dispatched through Discord webhooks with schema validation |
| `@spraxium/signal-client` | Lightweight envelope builder for the signal protocol — zero external dependencies, usable outside a Spraxium app |
| `@spraxium/env` | Typed environment variable validation with clear errors at startup |
| `@spraxium/analytics` | Runtime event tracking and bot metrics |
| `@spraxium/testing` | Test utilities and mock helpers for Spraxium applications |
| `@spraxium/cli` | Project scaffolding, module generation, and developer tooling via the `spraxium` CLI |

---

## Sharding

Spraxium has first-class support for Discord sharding. The `@spraxium/http` package integrates with `ShardingManager` directly — when sharding is enabled, the HTTP server boots on the manager process and communicates with shards through the bridge layer, so REST API consumers always get a unified view of bot state regardless of shard topology.

---

## Requirements

- Node.js 20+
- TypeScript 5.7+
- `experimentalDecorators` and `emitDecoratorMetadata` enabled in `tsconfig.json`

---

## License

Apache 2.0 — see [LICENSE](./LICENSE).

---

<p align="center">
  Built by <a href="https://github.com/spacelaxy"><img src=".github/assets/spacelaxy_logo.jpg" alt="Spacelaxy" height="16" style="vertical-align:middle;" /></a> <strong>Spacelaxy</strong>
</p>