import type { ExecutionContext } from '@spraxium/common';
import type { ExceptionLayoutPayload } from '../interfaces';
import type { SpraxiumException } from '../spraxium.exception';

export type LayoutFn = (
  exception: SpraxiumException,
  ctx: ExecutionContext,
) => ExceptionLayoutPayload | Promise<ExceptionLayoutPayload>;
