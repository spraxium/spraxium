import type { InterpolationVars } from '../types/interpolation-vars.type';

export interface LocalizedField {
  /** Translation key for the field name. */
  nameKey: string;
  /** Translation key for the field value. */
  valueKey: string;
  /** Whether the field is inline. */
  inline?: boolean;
  /** Variables for interpolation on the name. */
  nameVars?: InterpolationVars;
  /** Variables for interpolation on the value. */
  valueVars?: InterpolationVars;
}
