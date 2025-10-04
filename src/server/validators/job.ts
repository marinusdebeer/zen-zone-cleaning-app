/**
 * JOB VALIDATION SCHEMAS
 * 
 * Purpose:
 * Zod schemas for validating job-related inputs.
 * 
 * Schemas:
 * - createJobSchema: Validation for new job creation
 * - updateJobSchema: Validation for job updates
 * - jobStatusUpdateSchema: Validation for status changes
 * 
 * Business Logic:
 * - Validates all job fields with proper types
 * - Ensures required fields are present
 * - Validates scheduling patterns
 * - Note: Assignees are for visits, not stored on job
 */

import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  clientId: z.string().min(1, 'Client is required'),
  propertyId: z.string().optional(),
  jobNumber: z.string().optional(),
  status: z.string().default('Draft'),
  priority: z.string().default('normal'),
  
  // Scheduling
  startDate: z.coerce.date().optional(),
  startTime: z.string().optional(), // Time in HH:mm format
  duration: z.number().default(120), // Duration in minutes (default 2 hours)
  isRecurring: z.boolean().default(false),
  recurringPattern: z.string().optional(),
  recurringDays: z.array(z.number()).optional(),
  recurringEndDate: z.coerce.date().optional(),
  
  // Financial
  billingFrequency: z.string().default('PER_VISIT'),
  taxRate: z.number().default(13), // Default tax rate - cost comes from line items
  
  // Line items (from estimate conversion)
  lineItems: z.array(z.object({
    name: z.string(),
    description: z.string().nullable().optional(),
    quantity: z.number(),
    unitPrice: z.number(),
    total: z.number(),
    order: z.number(),
  })).optional(),
  
  // Conversion tracking
  convertedFromEstimateId: z.string().optional(),
  
  // Team (visits only, not stored on job)
  assignees: z.array(z.string()).default([]),
  
  custom: z.any().default({}),
});

export const updateJobSchema = createJobSchema.partial().extend({
  id: z.string(),
  status: z.string().optional(),
});

export const jobStatusUpdateSchema = z.object({
  id: z.string(),
  status: z.string(),
});

export type CreateJobData = z.infer<typeof createJobSchema>;
export type UpdateJobData = z.infer<typeof updateJobSchema>;
export type JobStatusUpdateData = z.infer<typeof jobStatusUpdateSchema>;
