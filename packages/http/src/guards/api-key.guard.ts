import { timingSafeEqual } from 'node:crypto';
import type { Context } from 'hono';
import type { HttpGuard } from '../interfaces';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export class ApiKeyGuard implements HttpGuard {
  private readonly keyBuffer: Buffer;

  constructor(apiKey: string) {
    this.keyBuffer = Buffer.from(apiKey);
  }

  async canActivate(ctx: Context): Promise<boolean> {
    const provided = ctx.req.header('x-api-key');
    if (!provided) return false;

    const providedBuffer = Buffer.from(provided);
    if (providedBuffer.length !== this.keyBuffer.length) return false;

    return timingSafeEqual(this.keyBuffer, providedBuffer);
  }
}
