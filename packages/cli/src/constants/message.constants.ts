export const MessageConstant = {
  BUILD_TYPE_CHECKING: 'Type-checking…',
  BUILD_TYPE_CHECK_PASSED: 'Type-check passed',
  BUILD_TYPE_CHECK_FAILED: 'Type-check failed',
  BUILD_COMPILING: 'Compiling…',
  BUILD_COMPLETE: 'Build complete',
  BUILD_FAILED: 'Build failed',
  BUILD_FIXING_IMPORTS: 'Fixing ESM imports…',
  BUILD_FIXED_IMPORTS: 'Fixed imports in',
  INFO_HEADER: 'Spraxium Environment Info',
  INFO_PM_HEADER: 'Package Managers',
  INFO_FW_HEADER: 'Spraxium Packages',
  INFO_TIP: 'Paste this output into a GitHub issue for faster triage.',
  INFO_NO_PACKAGES: 'No @spraxium/* packages found.',
  START_NO_ENTRY: 'No compiled entry found. Run "spraxium build" first.',
  START_STARTING: 'Starting',
  DEV_NO_MAIN: 'Could not find src/main.ts — are you inside a Spraxium project?',
  GENERATE_WHICH_SCHEMATIC: 'Which schematic would you like to generate?',
  GENERATE_NAME_REQUIRED: 'Name is required',
  GENERATE_FILE_EXISTS: (fileName: string): string => `${fileName} already exists. Overwrite?`,
  GENERATE_NAME_PROMPT: (schematicName: string): string => `${schematicName} name:`,
  GENERATE_SUFFIX_ERROR: (kebabName: string, suffix: string): string =>
    `Name "${kebabName}" already contains the schematic suffix "${suffix}". ` +
    `This would generate "${kebabName}.${suffix}.ts". Please choose a different name.`,
  GENERATE_WHICH_MODULE: (schematicName: string): string =>
    `Which module should contain this ${schematicName}?`,

  ABORTED: 'Aborted.',
  NO_SRC_DIR: 'Could not find src/ directory. Are you inside a Spraxium project?',
} as const;
