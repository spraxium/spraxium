import type { TemplateDefinition } from '../interfaces';

export const NewCommandConstant = {
  ALL_PACKAGE_MANAGERS: ['pnpm', 'bun', 'yarn', 'npm'] as const,

  CORE_PACKAGES: ['@spraxium/common', '@spraxium/core', '@spraxium/env', 'discord.js'] as const,

  CLI_DEV_PACKAGES: ['@spraxium/cli', 'typescript', '@types/node', 'tsdown'] as const,

  EXTRA_PACKAGES: [
    { pkg: '@spraxium/components', label: 'components', module: 'ComponentsModule' },
    { pkg: '@spraxium/http', label: 'http', module: 'HttpModule' },
    { pkg: '@spraxium/schedule', label: 'schedule', module: 'ScheduleModule' },
    { pkg: '@spraxium/i18n', label: 'i18n', module: 'I18nModule' },
    { pkg: '@spraxium/signal', label: 'signal', module: null },
    { pkg: '@spraxium/signal-client', label: 'signal-client', module: null },
  ] as const,

  TEMPLATES: [
    {
      id: 'default',
      label: 'default',
      description: 'Minimal Discord bot, pick your modules interactively',
      extraPackages: [],
    },
    {
      id: 'slash-bot',
      label: 'slash-bot',
      description: 'Discord bot with a ready-to-use /ping slash command',
      extraPackages: [],
    },
    {
      id: 'http-bot',
      label: 'http-bot',
      description: 'Discord bot bundled with a lightweight REST API',
      extraPackages: ['@spraxium/http'],
    },
  ] satisfies ReadonlyArray<TemplateDefinition>,
} as const;
