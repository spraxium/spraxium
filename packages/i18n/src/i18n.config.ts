import { definePlugin } from '@spraxium/core';
import type { I18nConfig } from './interfaces/i18n-config.interface';

export const defineI18n = definePlugin<'i18n', I18nConfig>('i18n');
