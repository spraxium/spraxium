import type { Schematic } from '../interfaces';

export const ALL_SCHEMATICS: Array<Schematic> = [
  {
    name: 'module',
    aliases: ['m'],
    description: 'Generate a @Module() class',
    fileSuffix: 'module',
    moduleArray: '',
  },
  {
    name: 'service',
    aliases: ['s'],
    description: 'Generate an @Injectable() service class',
    fileSuffix: 'service',
    moduleArray: 'providers',
  },
  {
    name: 'task',
    aliases: ['t'],
    description: 'Generate a scheduled task service with @Cron()',
    fileSuffix: 'task',
    moduleArray: 'providers',
  },
  {
    name: 'boot-service',
    aliases: ['bs'],
    description: 'Generate a service with onBoot/onShutdown lifecycle hooks',
    fileSuffix: 'service',
    moduleArray: 'providers',
  },
  {
    name: 'listener',
    aliases: ['l'],
    description: 'Generate a @Listener() event listener class',
    fileSuffix: 'listener',
    moduleArray: 'listeners',
  },
  {
    name: 'slash-command',
    aliases: ['sc'],
    description: 'Generate a @SlashCommand() definition class',
    fileSuffix: 'command',
    moduleArray: 'commands',
  },
  {
    name: 'slash-handler',
    aliases: ['sh'],
    description: 'Generate a @SlashCommandHandler() execution class',
    fileSuffix: 'handler',
    moduleArray: 'handlers',
  },
  {
    name: 'prefix-command',
    aliases: ['pc'],
    description: 'Generate a @PrefixCommand() definition class',
    fileSuffix: 'command',
    moduleArray: 'commands',
  },
  {
    name: 'prefix-handler',
    aliases: ['ph'],
    description: 'Generate a @PrefixCommandHandler() execution class',
    fileSuffix: 'handler',
    moduleArray: 'handlers',
  },
  {
    name: 'http-controller',
    aliases: ['hc'],
    description: 'Generate an HTTP @Controller() + @HttpClientModule()',
    fileSuffix: 'controller',
    moduleArray: '',
  },
  {
    name: 'guard',
    aliases: ['gu'],
    description: 'Generate a custom @Guard() class',
    fileSuffix: 'guard',
    moduleArray: 'providers',
  },
  {
    name: 'button',
    aliases: ['btn'],
    description: 'Generate a @Button() component and @ButtonHandler()',
    fileSuffix: 'button',
    moduleArray: '',
  },
  {
    name: 'select',
    aliases: ['sel'],
    description: 'Generate a @StringSelect() component and handler',
    fileSuffix: 'select',
    moduleArray: '',
  },
  {
    name: 'modal',
    aliases: ['md'],
    description: 'Generate a @ModalComponent() form and @ModalHandler()',
    fileSuffix: 'modal',
    moduleArray: '',
  },
  {
    name: 'embed',
    aliases: ['em'],
    description: 'Generate an @Embed() declarative embed class',
    fileSuffix: 'embed',
    moduleArray: '',
  },
  {
    name: 'signal-listener',
    aliases: ['sl'],
    description: 'Generate a @SignalListener() with @OnSignal() handler',
    fileSuffix: 'signal',
    moduleArray: 'providers',
  },
  {
    name: 'timeout-task',
    aliases: ['tt'],
    description: 'Generate a service with @Timeout() one-shot scheduling',
    fileSuffix: 'task',
    moduleArray: 'providers',
  },
  {
    name: 'interval-task',
    aliases: ['it'],
    description: 'Generate a service with @Interval() scheduling',
    fileSuffix: 'task',
    moduleArray: 'providers',
  },
  {
    name: 'v2-component',
    aliases: ['v2'],
    description: 'Generate a @V2Container() component (Discord Components v2)',
    fileSuffix: 'component',
    moduleArray: '',
  },
];

export function buildSchematicLookup(schematics: Array<Schematic>): Map<string, Schematic> {
  const map = new Map<string, Schematic>();
  for (const s of schematics) {
    map.set(s.name, s);
    for (const alias of s.aliases) {
      map.set(alias, s);
    }
  }
  return map;
}
