import { z } from 'zod';

export const lineItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  qty: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  taxRate: z.number().min(0).max(100).optional(),
});

export const createInvoiceSchema = z.object({
  jobId: z.string().min(1, 'Job is required'),
  clientId: z.string().min(1, 'Client is required'),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  dueAt: z.coerce.date().optional(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  id: z.string(),
  status: z.string().optional(),
});

export type LineItemData = z.infer<typeof lineItemSchema>;
export type CreateInvoiceData = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceData = z.infer<typeof updateInvoiceSchema>;

