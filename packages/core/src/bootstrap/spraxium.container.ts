import { ReadonlyContainer } from '@spraxium/common';

export class SpraxiumContainer extends ReadonlyContainer {
  private readonly instances = new Map<unknown, unknown>();

  constructor(private readonly parent?: SpraxiumContainer) {
    super();
  }

  set(token: unknown, instance: unknown): void {
    this.instances.set(token, instance);
  }

  get<T = unknown>(token: unknown): T | undefined {
    return (this.instances.get(token) as T | undefined) ?? this.parent?.get<T>(token);
  }

  has(token: unknown): boolean {
    return this.instances.has(token) || (this.parent?.has(token) ?? false);
  }

  createChild(): SpraxiumContainer {
    return new SpraxiumContainer(this);
  }
}
