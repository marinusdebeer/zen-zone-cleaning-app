import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  clientId: z.string().min(1, 'Client is required'),
  propertyId: z.string().optional(),
  scheduledAt: z.coerce.date().optional(),
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
