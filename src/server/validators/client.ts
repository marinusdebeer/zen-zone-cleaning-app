import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  emails: z.array(z.string().email()).default([]),
  phones: z.array(z.string()).default([]),
  addresses: z.array(z.string()).default([]),
  custom: z.any().default({}),
});

export const updateClientSchema = createClientSchema.partial().extend({
  id: z.string(),
});

export type CreateClientData = z.infer<typeof createClientSchema>;
export type UpdateClientData = z.infer<typeof updateClientSchema>;
