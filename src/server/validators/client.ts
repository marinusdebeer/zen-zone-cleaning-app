/**
 * CLIENT VALIDATION SCHEMAS
 * 
 * Purpose:
 * Zod schemas for validating client-related inputs.
 * 
 * Schemas:
 * - createClientSchema: Validation for new client creation
 * - updateClientSchema: Validation for client updates
 * 
 * Business Logic:
 * - Validates email format in emails array
 * - Allows multiple contact methods (emails, phones, addresses)
 * - Custom field for additional JSON data
 */

import { z } from 'zod';

export const createClientSchema = z.object({
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  companyName: z.string().nullable().optional(),
  emails: z.array(z.string().email()).default([]),
  phones: z.array(z.string()).default([]),
  addresses: z.array(z.string()).default([]),
  custom: z.any().default({}),
}).refine(
  (data) => data.firstName || data.lastName || data.companyName,
  { message: 'At least one of firstName, lastName, or companyName is required' }
);

export const updateClientSchema = createClientSchema.partial().extend({
  id: z.string(),
});

export type CreateClientData = z.infer<typeof createClientSchema>;
export type UpdateClientData = z.infer<typeof updateClientSchema>;
