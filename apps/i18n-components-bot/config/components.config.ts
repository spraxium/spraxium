import { defineComponents } from '@spraxium/components';

export const componentsConfig = defineComponents({
  context: {
    storage: { type: 'file' },
    defaultTtl: 300,
  },
  button: { ephemeralErrors: true },
  select: { ephemeralErrors: true },
});
