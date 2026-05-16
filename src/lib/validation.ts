import { z } from 'zod';

export const createEntrySchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
});

export const updateEntrySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).optional(),
});

export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;
