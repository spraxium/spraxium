import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type { V2ChildDef } from '../interfaces';

/**
 * Retrieves the V2 children metadata array from a class prototype,
 * creating it if it does not exist yet.
 */
export function getChildren(target: object): Array<V2ChildDef> {
  const existing: Array<V2ChildDef> | undefined = Reflect.getMetadata(
    COMPONENT_METADATA_KEYS.V2_CHILDREN,
    target,
  );
  if (existing) return existing;
  const fresh: Array<V2ChildDef> = [];
  Reflect.defineMetadata(COMPONENT_METADATA_KEYS.V2_CHILDREN, fresh, target);
  return fresh;
}

/**
 * Registers a V2 child definition on a class prototype.
 * Automatically assigns an incremental order based on registration sequence.
 */
export function registerChild(
  target: object,
  propertyKey: string,
  def: Omit<V2ChildDef, 'propertyKey' | 'order' | 'when'>,
): void {
  const children = getChildren(target.constructor as object);
  children.push({ ...def, propertyKey, order: children.length });
}
