import type { SpraxiumOnBoot, SpraxiumOnReady, SpraxiumOnShutdown } from './lifecycle.interface';
import type { ReadonlyContainer } from './readonly-container.interface';

/** Declares infrastructure that needs its own instance for each application. */
export interface ModuleIntegration {
  readonly name: string;

  /** Creates an integration before the application constructs its providers. */
  setup(context: ModuleIntegrationContext): ModuleIntegrationInstance;
}

export interface ModuleIntegrationContext {
  readonly container: ReadonlyContainer;
}

export interface ModuleIntegrationInstance
  extends Partial<SpraxiumOnBoot>,
    Partial<SpraxiumOnReady>,
    Partial<SpraxiumOnShutdown> {
  /** Receives each instance created by the module loader. */
  onInstance?(instance: unknown): void;

  /** Runs after all providers have finished their ready hooks. */
  onApplicationReady?(): void | Promise<void>;
}
