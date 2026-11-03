---
"@spraxium/logger": patch
---

Track command-logging listeners per Discord client instead of with a single global flag. Previously only the first client passed to `Logger.setClient()` ever produced command events; every distinct client now gets exactly one listener, and re-attaching the same client is still a no-op. Adds `Logger.detachClient(client)` to remove that listener, and `CommandLogger.bind()` now returns an unbind function.
