import { MESSAGES } from '../../constants/messages.constant';
import { MetadataHelper } from '../../utils/metadata.util';

/** Validates that the environment variable is a non-empty string. */
export function IsString(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'IsString',
      type: 'string',
      validate: (value) => (typeof value === 'string' ? null : MESSAGES.EXPECTED_STRING),
    });
  };
}
