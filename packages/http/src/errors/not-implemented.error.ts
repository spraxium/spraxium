import { HttpError } from './http.error';

export class NotImplementedError extends HttpError {
  constructor(message = 'Not implemented') {
    super(message, 501);
    this.name = 'NotImplementedError';
  }
}
