import type { PrefixArgMetadata } from '@spraxium/common';
import type { Message } from 'discord.js';

export type ParseFn = (raw: string, meta: PrefixArgMetadata, message: Message) => unknown;
