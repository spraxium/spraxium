import { definePlugin } from '@spraxium/core';
import type { ComponentsConfig } from './interfaces';

export const defineComponents = definePlugin<'components', ComponentsConfig>('components');
