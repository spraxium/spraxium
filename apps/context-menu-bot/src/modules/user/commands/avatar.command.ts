import { ContextMenuCommand } from '@spraxium/common';
import { PermissionFlagsBits } from 'discord.js';

@ContextMenuCommand({
  name: 'Avatar',
  type: 'user',
  defaultMemberPermissions: PermissionFlagsBits.SendMessages,
})
export class AvatarCommand {}
