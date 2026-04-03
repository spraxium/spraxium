import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { SCHEDULE_METADATA_KEYS } from '../../src/constants/metadata-keys.constant';
import { Timeout } from '../../src/decorators/timeout.decorator';
import type { TimeoutJobMetadata } from '../../src/interfaces/timeout-job-metadata.interface';

const proto = {};

describe('@Timeout decorator', () => {
  it('sets TIMEOUT metadata with the given ms value', () => {
    Timeout(3_000)(proto, 'method1', {} as PropertyDescriptor);
    const meta = Reflect.getMetadata(SCHEDULE_METADATA_KEYS.TIMEOUT, proto, 'method1') as TimeoutJobMetadata;
    expect(meta.ms).toBe(3_000);
  });

  it('allows ms = 0', () => {
    expect(() => Timeout(0)(proto, 'method2', {} as PropertyDescriptor)).not.toThrow();
    const meta = Reflect.getMetadata(SCHEDULE_METADATA_KEYS.TIMEOUT, proto, 'method2') as TimeoutJobMetadata;
    expect(meta.ms).toBe(0);
  });

  it('merges options into the metadata', () => {
    Timeout(1_000, { name: 'startup', disabled: true })(proto, 'method3', {} as PropertyDescriptor);
    const meta = Reflect.getMetadata(SCHEDULE_METADATA_KEYS.TIMEOUT, proto, 'method3') as TimeoutJobMetadata;
    expect(meta.name).toBe('startup');
    expect(meta.disabled).toBe(true);
  });

  it('throws for negative ms', () => {
    expect(() => Timeout(-1)).toThrow();
  });
});
