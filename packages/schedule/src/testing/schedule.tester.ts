import { MESSAGES } from '../constants/messages.constant';
import type { DiscoveredJob } from '../interfaces/discovered-job.interface';
import { JobMetadataReader } from '../metadata/job-metadata.reader';
import type { JobType } from '../types/job.type';

export class ScheduleTester {
  static async run(instance: object, methodName: string | symbol): Promise<void> {
    const method: unknown = Reflect.get(instance, methodName);
    if (typeof method !== 'function')
      throw new Error(
        MESSAGES.TESTER_NOT_A_METHOD(String(methodName), instance.constructor?.name ?? 'Object'),
      );
    await method.call(instance);
  }

  static async runAll(instance: object, type?: JobType): Promise<void> {
    for (const job of ScheduleTester.discover(instance)) {
      if (!job.disabled && (type === undefined || type === job.type))
        await ScheduleTester.run(instance, job.methodName);
    }
  }

  static discover(target: object): Array<DiscoveredJob> {
    const jobs: Array<DiscoveredJob> = [];
    for (const method of new JobMetadataReader().read(target)) {
      const metadata = method.metadata;
      jobs.push({
        methodName: method.methodName,
        type: metadata.type,
        expression: metadata.type === 'cron' ? metadata.expression : undefined,
        intervalMs: 'ms' in metadata ? metadata.ms : undefined,
        name: metadata.name,
        disabled: metadata.disabled ?? false,
      });
    }
    return jobs;
  }
}
