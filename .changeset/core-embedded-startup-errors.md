---
"@spraxium/core": minor
---

Add two startup options for hosts that embed Spraxium applications. `readyTimeoutMs` replaces the hardcoded 30-second READY timeout. `exitOnStartupFailure: false` makes `listen()` reject with a typed `SpraxiumStartupError` (`code`: `NO_TOKEN`, `LOGIN_FAILED`, `READY_TIMEOUT` or `ALREADY_LISTENING`, with the original error as `cause`) instead of terminating the process. In that mode a failed startup also releases the process lock. A rejected login now always clears the READY timer and its listener. The default behavior is unchanged.
