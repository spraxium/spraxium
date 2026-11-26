import type { ValidationDetail } from '../interfaces';
import { HttpError } from './http.error';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export class ValidationError extends HttpError {
  public readonly details: Array<ValidationDetail>;

  constructor(details: Array<ValidationDetail>) {
    super('Validation failed', 400);
    this.name = 'ValidationError';
    this.details = details;
  }
}
