import { MESSAGES } from '../../constants/messages.constant';
import { MetadataHelper } from '../../utils/metadata.util';

/** Validates that the environment variable is a boolean (`true`, `false`, `1`, or `0`). */
export function IsBoolean(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'IsBoolean',
      type: 'boolean',
      transform: (raw) => {
        const lower = raw.toLowerCase().trim();
        if (lower === 'true' || lower === '1') return true;
        if (lower === 'false' || lower === '0') return false;
        return raw;
      },
      validate: (value) => (typeof value === 'boolean' ? null : MESSAGES.EXPECTED_BOOLEAN(value)),
    });
  };
}
