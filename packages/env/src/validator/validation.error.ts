import { MESSAGES } from '../constants/messages.constant';
import type { EnvFieldErrorReason } from '../types/env-field-error-reason.type';

export class EnvFieldError {
  constructor(
    public readonly key: string,
    public readonly reason: EnvFieldErrorReason,
    public readonly secret: boolean = false,
    public readonly received?: string,
    public readonly message?: string,
  ) {}
}

export class EnvValidationError extends Error {
  constructor(public readonly fieldErrors: Array<EnvFieldError>) {
    super(MESSAGES.VALIDATION_ERROR(fieldErrors.length));
    this.name = MESSAGES.VALIDATION_ERROR_NAME;
  }
}
