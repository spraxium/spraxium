import type { ISchematic } from '../interfaces';
import { BootServiceSchematic } from './boot-service.schematic';
import { ListenerSchematic } from './listener.schematic';
import { ModuleSchematic } from './module.schematic';
import { ServiceSchematic } from './service.schematic';
import { TaskSchematic } from './task.schematic';

export const ALL_SCHEMATICS: Array<ISchematic> = [
  new ModuleSchematic(),
  new ServiceSchematic(),
  new TaskSchematic(),
  new BootServiceSchematic(),
  new ListenerSchematic(),
];

export function buildSchematicLookup(schematics: Array<ISchematic>): Map<string, ISchematic> {
  const map = new Map<string, ISchematic>();
  for (const s of schematics) {
    map.set(s.name, s);
    for (const alias of s.aliases) {
      map.set(alias, s);
    }
  }
  return map;
}
