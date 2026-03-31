import { HttpError } from './http.error';

export class MethodNotAllowedError extends HttpError {
  constructor(message = 'Method not allowed') {
    super(message, 405);
    this.name = 'MethodNotAllowedError';
  }
}
