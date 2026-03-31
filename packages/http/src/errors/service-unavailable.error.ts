import { HttpError } from './http.error';

export class ServiceUnavailableError extends HttpError {
  constructor(message = 'Service unavailable') {
    super(message, 503);
    this.name = 'ServiceUnavailableError';
  }
}
