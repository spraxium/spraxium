import { CollectionDefinition, JsonCollection } from '@spraxium/storage-json';
import { z } from 'zod';

export const demoNoteSchema = z.object({
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  reads: z.number(),
});

export type DemoNote = z.infer<typeof demoNoteSchema>;

export function isDemoNote(value: unknown): value is DemoNote {
  return demoNoteSchema.safeParse(value).success;
}

@JsonCollection({
  name: 'demo-notes',
  defaults: () => {
    const now = new Date().toISOString();
    return {
      welcome: {
        content: 'This note was created by the collection default factory.',
        createdAt: now,
        updatedAt: now,
        reads: 0,
      },
    };
  },
  schema: demoNoteSchema,
})
export class DemoNotesCollection extends CollectionDefinition<DemoNote> {}
