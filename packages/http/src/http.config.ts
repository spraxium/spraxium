import { definePlugin } from '@spraxium/core';
import type { HttpConfig } from './interfaces';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export const defineHttp = definePlugin<'http', HttpConfig>('http');
