import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { SCHEDULE_METADATA_KEYS } from '../../src/constants/metadata-keys.constant';
import { AfterOnline } from '../../src/decorators/after-online.decorator';
import type { AfterOnlineJobMetadata } from '../../src/interfaces/after-online-job-metadata.interface';

const proto = {};

describe('@AfterOnline decorator', () => {
  it('sets AFTER_ONLINE metadata with the given ms value', () => {
    AfterOnline(2_000)(proto, 'method1', {} as PropertyDescriptor);
    const meta = Reflect.getMetadata(
      SCHEDULE_METADATA_KEYS.AFTER_ONLINE,
      proto,
      'method1',
    ) as AfterOnlineJobMetadata;
    expect(meta.ms).toBe(2_000);
  });

  it('allows ms = 0', () => {
    expect(() => AfterOnline(0)(proto, 'method2', {} as PropertyDescriptor)).not.toThrow();
    const meta = Reflect.getMetadata(
      SCHEDULE_METADATA_KEYS.AFTER_ONLINE,
      proto,
      'method2',
    ) as AfterOnlineJobMetadata;
    expect(meta.ms).toBe(0);
  });

  it('merges options into the metadata', () => {
    AfterOnline(5_000, { name: 'post-boot', disabled: false })(proto, 'method3', {} as PropertyDescriptor);
    const meta = Reflect.getMetadata(
      SCHEDULE_METADATA_KEYS.AFTER_ONLINE,
      proto,
      'method3',
    ) as AfterOnlineJobMetadata;
    expect(meta.name).toBe('post-boot');
    expect(meta.disabled).toBe(false);
  });

  it('throws for negative ms', () => {
    expect(() => AfterOnline(-100)).toThrow();
  });
});
