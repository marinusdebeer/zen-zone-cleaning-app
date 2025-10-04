/**
 * INVOICE VALIDATION SCHEMAS
 * 
 * Purpose:
 * Zod schemas for validating invoice and line item inputs.
 * 
 * Schemas:
 * - lineItemSchema: Validation for individual line items
 * - createInvoiceSchema: Validation for new invoice creation
 * - updateInvoiceSchema: Validation for invoice updates
 * 
 * Business Logic:
 * - Validates line item quantities and prices
 * - Tax rate validation (0-100%)
 * - Requires at least one line item
 * - Ensures numeric values are non-negative
 */

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

