import 'reflect-metadata';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { METADATA_KEYS } from '@spraxium/common';
import type { Constructor, SlashOptionMetadata, SlashSubcommandGroupMetadata } from '@spraxium/common';
import chalk from 'chalk';
import {
  InteractionContextType,
  REST,
  type RESTPostAPIApplicationCommandsJSONBody,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
  SlashCommandBuilder,
} from 'discord.js';
import { logger } from '../logger';
import { applyOption } from './helpers';
import { SlashLocalizationBridge } from './slash-localization.bridge';
import type { SlashRegistry } from './slash.registry';
import type { SubcommandListEntry } from './types';

const HASH_DIR = path.join(process.cwd(), '.spraxium');
const HASH_FILE = path.join(HASH_DIR, 'commands.hash');

export class SlashRegistrar {
  constructor(private readonly registry: SlashRegistry) {}

  public async register(
    token: string,
    clientId: string,
    guildId?: string,
    force = false,
    extraPayloads: Array<RESTPostAPIApplicationCommandsJSONBody> = [],
  ): Promise<void> {
    const slashPayloads = this.buildPayloads();
    const payloads = [...slashPayloads, ...extraPayloads];
    if (payloads.length === 0) return;

    if (!force && process.env.NODE_ENV === 'development' && this.isUnchanged(payloads)) {
      logger.raw(`${chalk.yellow('⊘')}  Application commands unchanged , skipped REST registration (dev)`);
      return;
    }

    const rest = new REST({ version: '10' }).setToken(token);

    const route = guildId
      ? Routes.applicationGuildCommands(clientId, guildId)
      : Routes.applicationCommands(clientId);

    await rest.put(route, { body: payloads });

    const slashCount = slashPayloads.length;
    const extraCount = extraPayloads.length;
    const parts: Array<string> = [];
    if (slashCount > 0) parts.push(`${slashCount} slash`);
    if (extraCount > 0) parts.push(`${extraCount} context menu`);

    logger.raw(
      `${chalk.green('✔')}  Registered ${parts.join(' + ')} command(s)${guildId ? ` for guild ${guildId}` : ' globally'}`,
    );

    if (process.env.NODE_ENV === 'development') {
      this.writeHash(payloads);
    }
  }

  private isUnchanged(payloads: Array<RESTPostAPIApplicationCommandsJSONBody>): boolean {
    const hash = this.computeHash(payloads);
    try {
      return fs.readFileSync(HASH_FILE, 'utf-8').trim() === hash;
    } catch {
      return false;
    }
  }

  private writeHash(payloads: Array<RESTPostAPIApplicationCommandsJSONBody>): void {
    try {
      fs.mkdirSync(HASH_DIR, { recursive: true });
      fs.writeFileSync(HASH_FILE, this.computeHash(payloads), 'utf-8');
    } catch {
      /* non-fatal */
    }
  }

  private computeHash(payloads: Array<RESTPostAPIApplicationCommandsJSONBody>): string {
    return crypto.createHash('sha256').update(JSON.stringify(payloads)).digest('hex');
  }

  public buildPayloads(): Array<RESTPostAPIChatInputApplicationCommandsJSONBody> {
    const payloads: Array<RESTPostAPIChatInputApplicationCommandsJSONBody> = [];
    const commands = this.registry.allCommands();

    for (const [ctor, resolved] of commands) {
      const builder = new SlashCommandBuilder()
        .setName(resolved.config.name)
        .setDescription(resolved.config.description);

      if (resolved.config.i18n) {
        const locs = SlashLocalizationBridge.resolve(resolved.config.i18n);
        if (locs) {
          builder.setNameLocalizations(locs.name_localizations);
          builder.setDescriptionLocalizations(locs.description_localizations);
        }
      }

      if (resolved.config.dmPermission !== undefined) {
        builder.setContexts(
          resolved.config.dmPermission
            ? [
                InteractionContextType.Guild,
                InteractionContextType.BotDM,
                InteractionContextType.PrivateChannel,
              ]
            : [InteractionContextType.Guild],
        );
      }
      if (resolved.config.defaultMemberPermissions !== undefined) {
        builder.setDefaultMemberPermissions(resolved.config.defaultMemberPermissions);
      }
      if (resolved.config.nsfw) {
        builder.setNSFW(true);
      }

      const groupClasses: Array<Constructor> =
        Reflect.getOwnMetadata(METADATA_KEYS.SLASH_SUBCOMMAND_GROUPS, ctor) ?? [];

      if (groupClasses.length > 0) {
        this.applySubcommandGroups(builder, ctor, groupClasses);
      } else {
        const subs: Array<SubcommandListEntry> =
          Reflect.getMetadata(METADATA_KEYS.SLASH_SUBCOMMANDS_LIST, ctor) ?? [];

        if (subs.length > 0) {
          this.applySubcommands(builder, ctor, subs);
        } else {
          this.applyRootOptions(builder, ctor);
        }
      }

      payloads.push(builder.toJSON());
    }

    return payloads;
  }

  private applyRootOptions(builder: SlashCommandBuilder, ctor: Constructor): void {
    const options: Array<SlashOptionMetadata> =
      Reflect.getMetadata(METADATA_KEYS.SLASH_OPTION, ctor.prototype, 'build') ?? [];

    for (const opt of options) {
      applyOption(builder, opt);
    }
  }

  private applySubcommands(
    builder: SlashCommandBuilder,
    ctor: Constructor,
    subs: Array<SubcommandListEntry>,
  ): void {
    for (const sub of subs) {
      builder.addSubcommand((subBuilder) => {
        subBuilder.setName(sub.meta.name).setDescription(sub.meta.description);

        if (sub.meta.i18n) {
          const locs = SlashLocalizationBridge.resolve(sub.meta.i18n);
          if (locs) {
            subBuilder.setNameLocalizations(locs.name_localizations);
            subBuilder.setDescriptionLocalizations(locs.description_localizations);
          }
        }

        const options: Array<SlashOptionMetadata> =
          Reflect.getMetadata(METADATA_KEYS.SLASH_OPTION, ctor.prototype, sub.method) ?? [];
        for (const opt of options) {
          applyOption(subBuilder, opt);
        }

        return subBuilder;
      });
    }
  }

  private applySubcommandGroups(
    builder: SlashCommandBuilder,
    ctor: Constructor,
    groupClasses: Array<Constructor>,
  ): void {
    // Top-level subcommands on the command class (outside any group)
    const topLevelSubs: Array<SubcommandListEntry> =
      Reflect.getMetadata(METADATA_KEYS.SLASH_SUBCOMMANDS_LIST, ctor) ?? [];

    for (const sub of topLevelSubs) {
      builder.addSubcommand((subBuilder) => {
        subBuilder.setName(sub.meta.name).setDescription(sub.meta.description);

        if (sub.meta.i18n) {
          const locs = SlashLocalizationBridge.resolve(sub.meta.i18n);
          if (locs) {
            subBuilder.setNameLocalizations(locs.name_localizations);
            subBuilder.setDescriptionLocalizations(locs.description_localizations);
          }
        }

        const options: Array<SlashOptionMetadata> =
          Reflect.getMetadata(METADATA_KEYS.SLASH_OPTION, ctor.prototype, sub.method) ?? [];
        for (const opt of options) {
          applyOption(subBuilder, opt);
        }

        return subBuilder;
      });
    }

    for (const groupClass of groupClasses) {
      const groupMeta = Reflect.getOwnMetadata(METADATA_KEYS.SLASH_SUBCOMMAND_GROUP, groupClass) as
        | SlashSubcommandGroupMetadata
        | undefined;
      if (!groupMeta) continue;

      const groupSubs: Array<SubcommandListEntry> =
        Reflect.getMetadata(METADATA_KEYS.SLASH_SUBCOMMANDS_LIST, groupClass) ?? [];

      builder.addSubcommandGroup((groupBuilder) => {
        groupBuilder.setName(groupMeta.name).setDescription(groupMeta.description);

        if (groupMeta.i18n) {
          const locs = SlashLocalizationBridge.resolve(groupMeta.i18n);
          if (locs) {
            groupBuilder.setNameLocalizations(locs.name_localizations);
            groupBuilder.setDescriptionLocalizations(locs.description_localizations);
          }
        }

        for (const sub of groupSubs) {
          groupBuilder.addSubcommand((subBuilder) => {
            subBuilder.setName(sub.meta.name).setDescription(sub.meta.description);

            if (sub.meta.i18n) {
              const locs = SlashLocalizationBridge.resolve(sub.meta.i18n);
              if (locs) {
                subBuilder.setNameLocalizations(locs.name_localizations);
                subBuilder.setDescriptionLocalizations(locs.description_localizations);
              }
            }

            const options: Array<SlashOptionMetadata> =
              Reflect.getMetadata(METADATA_KEYS.SLASH_OPTION, groupClass.prototype, sub.method) ?? [];
            for (const opt of options) {
              applyOption(subBuilder, opt);
            }

            return subBuilder;
          });
        }

        return groupBuilder;
      });
    }
  }
}
