import type { Constructor } from '../types/constructor.type';

export interface ModuleMetadata {
  imports?: Array<Constructor>;
  providers?: Array<Constructor>;
  exports?: Array<Constructor>;
  /** @Listener()-decorated event listener classes. */
  listeners?: Array<Constructor>;
}