import { Module } from "@spraxium/common";
import { HelpCommand } from "./commands/help.command";
import { ModCommand } from "./commands/mod.command";
import { RollCommand } from "./commands/roll.command";
import { HelpHandler } from "./handlers/help-command.handler";
import { ModBanHandler } from "./handlers/mod-ban-command.handler";
import { ModKickHandler } from "./handlers/mod-kick-command.handler";
import { ModWarnHandler } from "./handlers/mod-warn-command.handler";
import { RollHandler } from "./handlers/roll-command.handler";

@Module({
  commands: [RollCommand, ModCommand, HelpCommand],
  handlers: [
    RollHandler,
    ModWarnHandler,
    ModKickHandler,
    ModBanHandler,
    HelpHandler,
  ],
})
export class PrefixModule {}
