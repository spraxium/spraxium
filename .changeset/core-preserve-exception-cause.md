---
"@spraxium/core": patch
---

Preserve the original error when the exception handler wraps a non-Spraxium error in `InternalException`. The original value is now available as the standard `Error.prototype.cause` (with its stack and cause chain) instead of being reduced to its message string. `SpraxiumException` accepts a `cause` option, and `InternalException` accepts `{ cause }` as a second argument. The `{{cause}}` template prop is unchanged.
