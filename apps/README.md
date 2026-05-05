# Spraxium Example Apps

This folder contains runnable example applications used by the Spraxium team to validate package behavior locally.

If the documentation is not enough for a specific use case, start from one of these examples as a base and adapt it to your project.

## App Map

| App | Focus | What you will learn |
|---|---|---|
| slash-bot | Slash commands | Basic handlers, subcommands, guards, and autocomplete |
| context-menu-bot | Context menu commands | User and message context menus (right-click → Apps), permissions, and target resolution |
| dynamic-bot | Dynamic V2 components | Async dynamic rows, generated content, and runtime-driven V2 replies |
| modal-bot | Modal workflows | Dynamic fields, validation, caching, radio groups, checkboxes, and select menus in modals |
| components-bot | UI components | Buttons, selects, modals, FlowContext, and V2 container layouts |
| guard-bot | Guards | Unified guard pipeline across slash commands and component handlers (buttons, selects, modals) |
| i18n-components-bot | i18n + UI components | buildLocalized* builders, per-user locale resolution, dual-locale support (en-US / pt-BR) |
| http-bot | HTTP integration | HTTP controllers/services and API plugin setup |
| i18n-bot | Internationalization | Locale files, per-user translation, and locale management commands |
| schedule-bot | Scheduled tasks | AfterOnline, Timeout, Interval, Cron, and RunOnce usage |
| signal-bot | Async signals | Webhook-driven events with SignalListener, OnSignal, and Zod schemas |
| webhook-bot | Discord webhooks | Declarative (@WebhookSender + @Send) and imperative (WebhookService) webhook APIs |
| sandbox | Full integration | Combined use of multiple packages in a broader modular architecture |

## Common Structure

All apps follow the same base structure:

```
apps/<app-name>/
  .env.example
  package.json
  spraxium.config.ts
  src/
    app.env.ts
    app.module.ts
    main.ts
```

Most apps also include:

- config/ for plugin config (defineHttp, defineSchedule, defineSignal, etc.)
- src/modules/ for feature modules and handlers

## Running an Example

From repository root:

```bash
pnpm install
```

Then pick an app:

```bash
cp apps/slash-bot/.env.example apps/slash-bot/.env
# edit .env and set required values
cd apps/slash-bot
pnpm dev
```

You can switch slash-bot with any other app folder.

## Important Notes

- These apps are intentionally simple and optimized for learning.
- They are great templates for starting new bots quickly.
- Before production, harden security, observability, persistence, and deployment settings.
