---
"@spraxium/common": patch
"@spraxium/core": patch
"@spraxium/components": patch
---

Resolve command, listener and component guards through the DI container that owns the handler. A guard registered as a module provider is now reused with its injected dependencies (repositories, configuration, loggers); guards that are not registered are still constructed with `new`. Per-use `@UseGuards([Guard, options])` options are applied to a per-call view and never written onto the shared instance. Ownership is tracked per handler instance, so applications sharing a handler class stay isolated. Guard constructor types now accept constructor parameters.
