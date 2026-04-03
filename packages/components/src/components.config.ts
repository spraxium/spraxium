import { definePlugin } from '@spraxium/core';
import type { ComponentsConfig } from './runtime/lifecycle/interfaces';

export const defineComponents = definePlugin<'components', ComponentsConfig>('components');
