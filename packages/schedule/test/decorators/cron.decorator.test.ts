import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { SCHEDULE_METADATA_KEYS } from '../../src/constants/metadata-keys.constant';
import { Cron } from '../../src/decorators/cron.decorator';
import type { CronJobMetadata } from '../../src/interfaces/cron-job-metadata.interface';

const proto = {};

describe('@Cron decorator', () => {
  it('sets CRON metadata with just an expression', () => {
    Cron('* * * * *')(proto, 'method1', {} as PropertyDescriptor);
    const meta = Reflect.getMetadata(SCHEDULE_METADATA_KEYS.CRON, proto, 'method1') as CronJobMetadata;
    expect(meta.expression).toBe('* * * * *');
  });

  it('merges options into the metadata', () => {
    Cron('0 9 * * 1-5', { name: 'daily', runOnInit: true, disabled: true, timezone: 'UTC' })(
      proto,
      'method2',
      {} as PropertyDescriptor,
    );
    const meta = Reflect.getMetadata(SCHEDULE_METADATA_KEYS.CRON, proto, 'method2') as CronJobMetadata;
    expect(meta.name).toBe('daily');
    expect(meta.runOnInit).toBe(true);
    expect(meta.disabled).toBe(true);
    expect(meta.timezone).toBe('UTC');
  });

  it('accepts a 6-field seconds-based expression', () => {
    expect(() => Cron('*/5 * * * * *')(proto, 'method3', {} as PropertyDescriptor)).not.toThrow();
  });

  it('throws for an invalid cron expression', () => {
    expect(() => Cron('not-a-cron')).toThrow();
  });

  it('throws for an out-of-range field', () => {
    expect(() => Cron('99 * * * *')).toThrow();
  });
});
