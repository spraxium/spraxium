import type { ValidationDetail } from '../interfaces';
import { HttpError } from './http.error';

export class ValidationError extends HttpError {
  public readonly details: Array<ValidationDetail>;

  constructor(details: Array<ValidationDetail>) {
    super('Validation failed', 400);
    this.name = 'ValidationError';
    this.details = details;
  }
}
