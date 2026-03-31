import { definePlugin } from '@spraxium/core';
import type { HttpConfig } from './interfaces';

export const defineHttp = definePlugin<'http', HttpConfig>('http');
