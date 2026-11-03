---
"@spraxium/core": patch
---

Honor `intents` passed to `SpraxiumFactory.create()`. They were dropped when the application state was initialized, so the Discord client silently fell back to the Standard preset. `addIntents()` now extends the factory-supplied intents, and `intents()` still replaces them.
