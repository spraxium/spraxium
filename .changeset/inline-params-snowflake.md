---
"@spraxium/components": patch
---

Stop inline params from rounding Discord snowflakes. `decodeInlineParams()` converted every numeric-looking value with `Number()`, so IDs such as `"1541331179284987915"` (above `Number.MAX_SAFE_INTEGER`) reached `@ButtonParams()` / `@SelectParams()` / modal params as a lossy number (`1541331179284987900`). A value now becomes a number only when the conversion is lossless (it round-trips exactly through `String(Number(raw))` and integers are safe integers); otherwise it stays a string. Values written by `encodeInlineParams()` from numbers still decode to the same numbers. Non-canonical numeric strings such as `"007"`, `"1e3"` or `"1.50"` are now kept as strings.
