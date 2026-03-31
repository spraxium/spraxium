import { HttpError } from './http.error';

export class TooManyRequestsError extends HttpError {
  constructor(message = 'Too many requests') {
    super(message, 429);
    this.name = 'TooManyRequestsError';
  }
}
