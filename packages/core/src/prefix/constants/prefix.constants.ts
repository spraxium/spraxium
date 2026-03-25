export const PREFIX_CONSTANTS = {
  booleanTruthy: ['true', 'yes', '1'] as ReadonlyArray<string>,
  booleanFalsy: ['false', 'no', '0'] as ReadonlyArray<string>,

  durationMultipliers: {
    ms: 1,
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
    w: 604_800_000,
  } as Record<string, number>,
};
