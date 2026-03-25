import type { SchematicInterface } from '../interfaces';
import { BootServiceSchematic } from './boot-service.schematic';
import { ListenerSchematic } from './listener.schematic';
import { ModuleSchematic } from './module.schematic';
import { ServiceSchematic } from './service.schematic';
import { TaskSchematic } from './task.schematic';

export const ALL_SCHEMATICS: SchematicInterface[] = [
  new ModuleSchematic(),
  new ServiceSchematic(),
  new TaskSchematic(),
  new BootServiceSchematic(),
  new ListenerSchematic(),
];

export function buildSchematicLookup(schematics: SchematicInterface[]): Map<string, SchematicInterface> {
  const map = new Map<string, SchematicInterface>();
  for (const s of schematics) {
    map.set(s.name, s);
    for (const alias of s.aliases) {
      map.set(alias, s);
    }
  }
  return map;
}
