import { describe, expect, it } from 'vitest';
import { CliError } from '../src/errors';
import type { Schematic } from '../src/interfaces';
import { ALL_SCHEMATICS, SchematicRegistry } from '../src/schematics/schematic.registry';

const SCHEMATICS: ReadonlyArray<Schematic> = [
  { name: 'module', aliases: ['m'], description: 'A module', fileSuffix: 'module', moduleArray: '' },
  {
    name: 'service',
    aliases: ['s'],
    description: 'A service',
    fileSuffix: 'service',
    moduleArray: 'providers',
  },
];

describe('SchematicRegistry', () => {
  it('lists schematics in declaration order', () => {
    const registry = new SchematicRegistry(SCHEMATICS);

    expect(registry.list().map((s) => s.name)).toEqual(['module', 'service']);
  });

  it('resolves a schematic by its canonical name', () => {
    const registry = new SchematicRegistry(SCHEMATICS);

    expect(registry.resolve('service').name).toBe('service');
  });

  it('resolves a schematic by alias', () => {
    const registry = new SchematicRegistry(SCHEMATICS);

    expect(registry.resolve('m').name).toBe('module');
  });

  it('returns undefined from find() for unknown names', () => {
    const registry = new SchematicRegistry(SCHEMATICS);

    expect(registry.find('nope')).toBeUndefined();
  });

  it('throws a CliError for unknown schematic names', () => {
    const registry = new SchematicRegistry(SCHEMATICS);

    expect(() => registry.resolve('controller')).toThrow(CliError);
  });

  it('lists available schematics in the validation error message', () => {
    const registry = new SchematicRegistry(SCHEMATICS);

    expect(() => registry.resolve('controller')).toThrow(/module, service/);
  });

  it('defaults to the full built-in schematic catalogue', () => {
    const registry = new SchematicRegistry();

    expect(registry.list()).toBe(ALL_SCHEMATICS);
    expect(registry.resolve('module').name).toBe('module');
  });

  it('exposes every built-in schematic by name and alias without collisions', () => {
    const registry = new SchematicRegistry();

    for (const schematic of ALL_SCHEMATICS) {
      expect(registry.resolve(schematic.name)).toBe(schematic);
      for (const alias of schematic.aliases) {
        expect(registry.resolve(alias)).toBe(schematic);
      }
    }
  });
});
