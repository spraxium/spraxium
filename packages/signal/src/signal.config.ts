import { definePlugin } from '@spraxium/core';
import type { SignalConfig } from './interfaces';

export const defineSignal = definePlugin<'signal', SignalConfig>('signal');
