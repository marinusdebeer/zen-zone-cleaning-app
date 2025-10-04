/**
 * REQUEST VALIDATORS
 * 
 * Purpose:
 * Zod schemas for validating request data
 */

import { z } from 'zod';

export const createRequestSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  propertyId: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  source: z.string().optional(),
  urgency: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  notes: z.string().optional(),
  // New fields from enhanced form
  industryId: z.string().optional(),
  serviceTypeId: z.string().optional(),
  hearAboutId: z.string().optional(),
  details: z.any().optional(),
  preferredAt: z.date().optional(),
});

export const updateRequestSchema = createRequestSchema.extend({
  id: z.string(),
  status: z.string().optional(),
});

