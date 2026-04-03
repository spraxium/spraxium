import type { PendingInstance } from '../interfaces';

/** Shared buffer that collects instances for deferred registration with the dispatcher. */
export const pendingInstances: Array<PendingInstance> = [];

/**
 * Creates an instance scanner callback for use with `ModuleLoader.instanceScanners`.
 * Each scanned instance is pushed to the pending array for later processing
 * by the `ComponentDispatcher`.
 */
export function createInstanceScanner(): (instance: unknown) => void {
  return (instance: unknown) => {
    if (instance && typeof instance === 'object') {
      pendingInstances.push({
        ctor: (instance as object).constructor as PendingInstance['ctor'],
        instance,
      });
    }
  };
}
