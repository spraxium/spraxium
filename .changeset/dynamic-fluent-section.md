---
"@spraxium/components": minor
"@spraxium/logger": patch
---

**`@spraxium/components`**

- Added `dynamic` option to `V2SectionFluentConfig`, enabling dynamic buttons inside sections when using the fluent builder API
- `V2ContainerFluentBuilder.section()` now accepts a `V2SectionFluentConfig` object as an alternative to the positional `(text, accessory?)` signature — passing `{ text, dynamic: { button, item } }` enqueues an async button resolution
- Added `renderAsync()` and `toReplyAsync()` to `V2ContainerFluentBuilder` for containers that contain dynamic sections
- `render()` and `toReply()` now throw a clear error when called on a builder that has pending dynamic sections, guiding users toward the async variants
- `V2Service.container()` now passes `ButtonService` to the fluent builder automatically — no extra wiring required
- Refactored `ContextAdapterFactory` from a standalone function to a static class (`ContextAdapterFactory.init()`); backward-compatible `initContextAdapter` wrapper kept as `@deprecated`

**`@spraxium/logger`**

- Fixed README (previously contained `@spraxium/schedule` content by mistake)
