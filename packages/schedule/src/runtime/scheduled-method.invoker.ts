import { ConfigurationException } from '@spraxium/core';

export class ScheduledMethodInvoker {
  constructor(
    private readonly instance: object,
    private readonly name: string | symbol,
  ) {}

  async execute(): Promise<void> {
    const method: unknown = Reflect.get(this.instance, this.name);
    if (typeof method !== 'function')
      throw new ConfigurationException({
        key: 'schedule',
        reason: `${String(this.name)} is no longer a method`,
      });
    await method.call(this.instance);
  }
}
