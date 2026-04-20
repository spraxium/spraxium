import { Module } from "@spraxium/common";
import { HelpCommand } from "./commands/help.command";
import { ModCommand } from "./commands/mod.command";
import { RollCommand } from "./commands/roll.command";
import { HelpHandler } from "./handlers/help.handler";
import { ModBanHandler } from "./handlers/mod-ban.handler";
import { ModKickHandler } from "./handlers/mod-kick.handler";
import { ModWarnHandler } from "./handlers/mod-warn.handler";
import { RollHandler } from "./handlers/roll.handler";

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
