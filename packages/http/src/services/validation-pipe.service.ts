import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationError } from '../errors/validation.error';

export class ValidationPipe {
  async transform<T extends object>(dto: new (...args: Array<unknown>) => T, body: unknown): Promise<T> {
    const instance = plainToInstance(dto, body);
    const errors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const details = errors.map((e) => ({
        property: e.property,
        constraints: e.constraints ?? {},
      }));
      throw new ValidationError(details);
    }

    return instance;
  }
}
