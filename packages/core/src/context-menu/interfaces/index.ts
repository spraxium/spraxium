import type {
  Constructor,
  ContextMenuCommandConfig,
  ContextMenuCommandHandlerMetadata,
} from '@spraxium/common';

export interface ResolvedContextMenuCommand {
  ctor: Constructor;
  config: ContextMenuCommandConfig;
}

export interface ResolvedContextMenuHandler {
  handlerCtor: Constructor;
  instance: unknown;
  meta: ContextMenuCommandHandlerMetadata;
  commandCtor: Constructor;
  config: ContextMenuCommandConfig;
}

export interface ResolvedContextMenuEntry {
  commandName: string;
  type: ContextMenuCommandConfig['type'];
  handlerClass: string;
}
