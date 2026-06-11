# @spraxium/components

## 0.3.3

### Patch Changes

- fc31895: ## Bug Fixes

  - Generate command: schematic templates are now resolved with a local-first, giget-fallback strategy, following the same approach already used by the new command. When running inside the monorepo, the bundled templates/schematics directory is used. For installed-package usage, templates are downloaded from GitHub via giget and cached on disk. This fixes the "schematic templates not found" error that affected users who installed @spraxium/cli as a package.

  ## Refactor

  - Added CliError to distinguish expected user-facing errors (missing template, failed download, invalid name, missing src directory, etc.) from unexpected runtime errors, allowing the CLI to display clean messages without exposing stack traces.
  - Introduced SchematicRegistry, wrapping ALL_SCHEMATICS with find, resolve, and list capabilities. Unknown schematic names now produce clear validation errors containing all valid options.
  - GenerateCommand now depends on SchematicRegistry instead of the raw schematic array, validates names before generation, and properly awaits asynchronous template rendering.
  - Refactored SchematicLoader to be fully injectable (origin directory, cache directory, giget source, downloader, etc.), making it significantly easier to unit test without requiring network access.
  - Improved template resolution, validation, error handling, and internal abstractions around schematic generation.
  - Environment info command: removed the redundant CLI version output. The InfoReport.cliVersion field and InfoCollector.readCliVersion() method were removed, since installed @spraxium/\* packages are already listed below and provide the same information with greater accuracy.

  ## Tests

  Added focused unit test coverage for:

  - SchematicLoader:

    - Local template resolution
    - Giget template downloads
    - Installed-package compatibility
    - Download caching behavior
    - Error handling
    - Retry-after-failure scenarios

  - SchematicRegistry:

    - Name resolution
    - Alias resolution
    - Unknown schematic validation

  - InfoCollector:

    - Project name detection
    - Package version collection
    - Package manager detection
    - Validation that CLI version is no longer reported

  - FileSystem:

    - Correct file generation destinations
    - Automatic parent directory creation

  These tests focus on real-world reliability and regression prevention, avoiding unnecessary coverage that does not provide practical value.

- Updated dependencies [fc31895]
  - @spraxium/common@0.2.5
  - @spraxium/core@0.2.5
  - @spraxium/logger@0.2.5

## 0.3.2

### Patch Changes

- 79acfea: Added flow context support for modal components, matching the behavior already available in other components. Also fixed general bugs and updated dependencies to maintain framework integrity.
- Updated dependencies [79acfea]
  - @spraxium/common@0.2.4
  - @spraxium/core@0.2.4
  - @spraxium/logger@0.2.4

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
