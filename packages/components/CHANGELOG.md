# @spraxium/components

## 0.3.1

### Patch Changes

- 808b582: `@spraxium/components` add `@ModalParams()` and `@ModalPayload()` parameter decorators for modal handlers, with `ModalService.buildWithParams()` and `buildWithPayload()` to produce the matching custom IDs. Modal payloads are auto-deleted after a successful handler run. `@ButtonHandler` and `@SelectHandler` now accept `@DynamicButton` and `@DynamicStringSelect` components directly, making `@DynamicButtonHandler` and `@DynamicSelectHandler` optional aliases. `PayloadService` is now injected into `ModalService` via DI instead of being instantiated inline. Internal: `ResolvedModalHandler.customId` renamed to `baseId`; custom-ID codec re-exported from `utils/custom-id`.

## 0.3.0

### Minor Changes

- dcd0fdd: **`@spraxium/components`**

  - Added `dynamic` option to `V2SectionFluentConfig`, enabling dynamic buttons inside sections when using the fluent builder API
  - `V2ContainerFluentBuilder.section()` now accepts a `V2SectionFluentConfig` object as an alternative to the positional `(text, accessory?)` signature — passing `{ text, dynamic: { button, item } }` enqueues an async button resolution
  - Added `renderAsync()` and `toReplyAsync()` to `V2ContainerFluentBuilder` for containers that contain dynamic sections
  - `render()` and `toReply()` now throw a clear error when called on a builder that has pending dynamic sections, guiding users toward the async variants
  - `V2Service.container()` now passes `ButtonService` to the fluent builder automatically — no extra wiring required
  - Refactored `ContextAdapterFactory` from a standalone function to a static class (`ContextAdapterFactory.init()`); backward-compatible `initContextAdapter` wrapper kept as `@deprecated`

  **`@spraxium/logger`**

  - Fixed README (previously contained `@spraxium/schedule` content by mistake)

### Patch Changes

- Updated dependencies [dcd0fdd]
  - @spraxium/logger@0.2.3
  - @spraxium/common@0.2.3
  - @spraxium/core@0.2.3

## 0.2.3

### Patch Changes

- 8a81354: fix: prevent removed memory context adapter error on startup when no configuration is provided

## 0.2.2

### Patch Changes

- fc4c5e0: change packages README with updated code examples
- Updated dependencies [fc4c5e0]
  - @spraxium/common@0.2.2
  - @spraxium/logger@0.2.2
  - @spraxium/core@0.2.2

## 0.2.1

### Patch Changes

- f70ad08: bump discord.js peer dependency to ^14.26.4
- Updated dependencies [f70ad08]
  - @spraxium/common@0.2.1
  - @spraxium/core@0.2.1

## 0.1.4

### Patch Changes

- 3d18457: Allow `rowData` in `@V2Row` to be a factory function `(data) => value`, so you can derive select data from the container's runtime data without wrapping in `@V2Dynamic`.

## 0.1.2

### Patch Changes

- change docs links
- Updated dependencies
  - @spraxium/common@0.1.2
  - @spraxium/core@0.1.2

## 0.1.1

### Patch Changes

- fix license and add README
- Updated dependencies
  - @spraxium/common@0.1.1
  - @spraxium/core@0.1.1
