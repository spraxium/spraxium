import type { Constructor } from '../types/constructor.type';
import type { ModuleIntegration } from './module-integration.interface';

export interface ModuleMetadata {
  /** Infrastructure attached to this application's module tree. */
  integrations?: ReadonlyArray<ModuleIntegration>;
  imports?: Array<Constructor>;
  providers?: Array<Constructor>;
  exports?: Array<Constructor>;
  /** @Listener()-decorated event listener classes. */
  listeners?: Array<Constructor>;
  /** @PrefixCommand()-decorated structure classes (metadata only). */
  commands?: Array<Constructor>;
  /** @PrefixCommandHandler()-decorated handler classes (execution logic). */
  handlers?: Array<Constructor>;
}
