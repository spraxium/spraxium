# @spraxium/cli

## 0.3.0

### Minor Changes

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

### Patch Changes

- Updated dependencies [fc31895]
  - @spraxium/logger@0.2.5

## 0.2.4

### Patch Changes

- 79acfea: Added flow context support for modal components, matching the behavior already available in other components. Also fixed general bugs and updated dependencies to maintain framework integrity.
- Updated dependencies [79acfea]
  - @spraxium/logger@0.2.4

## 0.2.3

### Patch Changes

- Updated dependencies [dcd0fdd]
  - @spraxium/logger@0.2.3

## 0.2.2

### Patch Changes

- fc4c5e0: change packages README with updated code examples
- Updated dependencies [fc4c5e0]
  - @spraxium/logger@0.2.2

## 0.2.1

### Patch Changes

- Add @spraxium/logger to default install and @spraxium/webhook to extra packages

## 0.1.2

### Patch Changes

- change docs links

## 0.1.1

### Patch Changes

- fix license and add README
