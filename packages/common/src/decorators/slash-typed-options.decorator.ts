import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { SlashOptionType } from '../interfaces/slash-option-metadata.interface';

/**
 * Creates a strongly-typed parameter decorator that injects a slash command
 * option value with a pre-known type. Unlike the generic `@SlashOption('name')`,
 * these decorators embed the Discord option type into the stored metadata so
 * that the invoker can resolve the value without looking up the command class.
 */
function createTypedParamDecorator(type: SlashOptionType) {
  return (name: string): ParameterDecorator =>
    (target: object, propertyKey: string | symbol | undefined, parameterIndex: number): void => {
      if (propertyKey === undefined) return;

      const existing: Array<{ index: number; name: string; type: SlashOptionType }> =
        Reflect.getMetadata(METADATA_KEYS.SLASH_OPT_PARAM, target, propertyKey) ?? [];

      Reflect.defineMetadata(
        METADATA_KEYS.SLASH_OPT_PARAM,
        [...existing, { index: parameterIndex, name, type }],
        target,
        propertyKey,
      );
    };
}

/**
 * Injects the value of a `STRING` slash command option.
 * Resolves to `string | null` at runtime.
 *
 * @param name - The option name as declared on the command class.
 *
 * @example
 * async handle(
 *   \@Ctx() interaction: ChatInputCommandInteraction,
 *   \@SlashStringOption('text') text: string | null,
 * ) {}
 */
export const SlashStringOption = createTypedParamDecorator('STRING');

/**
 * Injects the value of an `INTEGER` slash command option.
 * Resolves to `number | null` at runtime.
 *
 * @param name - The option name as declared on the command class.
 *
 * @example
 * async handle(
 *   \@Ctx() interaction: ChatInputCommandInteraction,
 *   \@SlashIntegerOption('count') count: number | null,
 * ) {}
 */
export const SlashIntegerOption = createTypedParamDecorator('INTEGER');

/**
 * Injects the value of a `NUMBER` (decimal) slash command option.
 * Resolves to `number | null` at runtime.
 *
 * @param name - The option name as declared on the command class.
 *
 * @example
 * async handle(
 *   \@Ctx() interaction: ChatInputCommandInteraction,
 *   \@SlashNumberOption('ratio') ratio: number | null,
 * ) {}
 */
export const SlashNumberOption = createTypedParamDecorator('NUMBER');

/**
 * Injects the value of a `BOOLEAN` slash command option.
 * Resolves to `boolean | null` at runtime.
 *
 * @param name - The option name as declared on the command class.
 *
 * @example
 * async handle(
 *   \@Ctx() interaction: ChatInputCommandInteraction,
 *   \@SlashBooleanOption('flag') flag: boolean | null,
 * ) {}
 */
export const SlashBooleanOption = createTypedParamDecorator('BOOLEAN');

/**
 * Injects the value of a `USER` slash command option.
 * Resolves to a discord.js `User | null` at runtime.
 *
 * @param name - The option name as declared on the command class.
 *
 * @example
 * async handle(
 *   \@Ctx() interaction: ChatInputCommandInteraction,
 *   \@SlashUserOption('target') target: User | null,
 * ) {}
 */
export const SlashUserOption = createTypedParamDecorator('USER');

/**
 * Injects the value of a `CHANNEL` slash command option.
 * Resolves to a discord.js `GuildBasedChannel | null` at runtime.
 *
 * @param name - The option name as declared on the command class.
 *
 * @example
 * async handle(
 *   \@Ctx() interaction: ChatInputCommandInteraction,
 *   \@SlashChannelOption('channel') channel: TextChannel | null,
 * ) {}
 */
export const SlashChannelOption = createTypedParamDecorator('CHANNEL');

/**
 * Injects the value of a `ROLE` slash command option.
 * Resolves to a discord.js `Role | null` at runtime.
 *
 * @param name - The option name as declared on the command class.
 *
 * @example
 * async handle(
 *   \@Ctx() interaction: ChatInputCommandInteraction,
 *   \@SlashRoleOption('role') role: Role | null,
 * ) {}
 */
export const SlashRoleOption = createTypedParamDecorator('ROLE');

/**
 * Injects the value of a `MENTIONABLE` slash command option.
 * Resolves to a discord.js `User | Role | null` at runtime.
 *
 * @param name - The option name as declared on the command class.
 *
 * @example
 * async handle(
 *   \@Ctx() interaction: ChatInputCommandInteraction,
 *   \@SlashMentionableOption('mention') mention: User | Role | null,
 * ) {}
 */
export const SlashMentionableOption = createTypedParamDecorator('MENTIONABLE');

/**
 * Injects the value of an `ATTACHMENT` slash command option.
 * Resolves to a discord.js `Attachment | null` at runtime.
 *
 * @param name - The option name as declared on the command class.
 *
 * @example
 * async handle(
 *   \@Ctx() interaction: ChatInputCommandInteraction,
 *   \@SlashAttachmentOption('file') file: Attachment | null,
 * ) {}
 */
export const SlashAttachmentOption = createTypedParamDecorator('ATTACHMENT');
