import { HttpError } from './http.error';

export interface ValidationDetail {
  readonly property: string;
  readonly constraints: Record<string, string>;
}

export class ValidationError extends HttpError {
  public readonly details: Array<ValidationDetail>;

  constructor(details: Array<ValidationDetail>) {
    super('Validation failed', 400);
    this.name = 'ValidationError';
    this.details = details;
  }
}
