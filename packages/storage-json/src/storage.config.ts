import { definePlugin } from '@spraxium/core';
import type { StorageConfig } from './interfaces/storage-config.interface';

export const defineStorage = definePlugin<'storage', StorageConfig>('storage');
