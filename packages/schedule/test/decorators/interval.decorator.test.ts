import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { SCHEDULE_METADATA_KEYS } from '../../src/constants/metadata-keys.constant';
import { Interval } from '../../src/decorators/interval.decorator';
import type { IntervalJobMetadata } from '../../src/interfaces/interval-job-metadata.interface';

const proto = {};

describe('@Interval decorator', () => {
  it('sets INTERVAL metadata with the given ms value', () => {
    Interval(5_000)(proto, 'method1', {} as PropertyDescriptor);
    const meta = Reflect.getMetadata(
      SCHEDULE_METADATA_KEYS.INTERVAL,
      proto,
      'method1',
    ) as IntervalJobMetadata;
    expect(meta.ms).toBe(5_000);
  });

  it('merges options into the metadata', () => {
    Interval(10_000, { name: 'poller', runOnInit: true, disabled: false })(
      proto,
      'method2',
      {} as PropertyDescriptor,
    );
    const meta = Reflect.getMetadata(
      SCHEDULE_METADATA_KEYS.INTERVAL,
      proto,
      'method2',
    ) as IntervalJobMetadata;
    expect(meta.name).toBe('poller');
    expect(meta.runOnInit).toBe(true);
    expect(meta.disabled).toBe(false);
  });

  it('throws for ms = 0', () => {
    expect(() => Interval(0)).toThrow();
  });

  it('throws for negative ms', () => {
    expect(() => Interval(-500)).toThrow();
  });
});
