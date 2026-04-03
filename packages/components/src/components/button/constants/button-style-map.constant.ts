import { ButtonStyle } from 'discord.js';
import type { ButtonStyleName } from '../types';

export const BUTTON_STYLE_MAP: Record<ButtonStyleName, ButtonStyle> = {
  primary: ButtonStyle.Primary,
  secondary: ButtonStyle.Secondary,
  success: ButtonStyle.Success,
  danger: ButtonStyle.Danger,
};
