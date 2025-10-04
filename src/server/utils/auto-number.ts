/**
 * AUTO-INCREMENTING NUMBER UTILITY (PER-ORG)
 * 
 * Purpose:
 * Generate sequential display numbers for all entities per organization
 * Numbers are unique per entity type AND per org, start at 1, and auto-increment
 * 
 * Usage:
 * const number = await getNextNumber(orgId, 'invoice');
 * 
 * Features:
 * - Auto-increment using OrgCounter table
 * - Unique per entity type per organization
 * - Thread-safe with transaction + unique constraint
 * - Returns next available number
 */

import { prisma } from '../db';

type EntityType = 'client' | 'request' | 'estimate' | 'job' | 'invoice' | 'payment' | 'visit';

/**
 * Get the next available number for an entity type within an organization
 * Uses OrgCounter table with atomic increment in transaction
 */
export async function getNextNumber(orgId: string, scope: EntityType): Promise<number> {
  return await prisma.$transaction(async (tx) => {
    const counter = await tx.orgCounter.upsert({
      where: { 
        orgId_scope: { 
          orgId, 
          scope 
        } 
      },
      update: { 
        value: { increment: 1 } 
      },
      create: { 
        orgId, 
        scope, 
        value: 1 
      },
    });
    return counter.value;
  });
}

/**
 * Check if a number is available for an entity type within an organization
 * Used when user wants to manually set a number
 */
export async function isNumberAvailable(
  orgId: string,
  entityType: EntityType,
  number: number,
  excludeId?: string
): Promise<boolean> {
  const MODEL_MAP = {
    client: prisma.client,
    request: prisma.request,
    estimate: prisma.estimate,
    job: prisma.job,
    invoice: prisma.invoice,
    payment: prisma.payment,
    visit: prisma.visit,
  };
  
  const model = MODEL_MAP[entityType];
  
  const existing = await (model as any).findFirst({
    where: { 
      orgId,
      number 
    },
    select: { id: true },
  });

  // Number is available if:
  // 1. It doesn't exist, OR
  // 2. It exists but belongs to the entity we're updating (excludeId)
  return !existing || (excludeId !== undefined && existing.id === excludeId);
}

/**
 * Validate and get a number for create/update
 * If number provided, validates it's available within the org
 * If not provided, gets next available number for the org
 */
export async function getValidatedNumber(
  orgId: string,
  entityType: EntityType,
  requestedNumber?: number,
  excludeId?: string
): Promise<number> {
  if (requestedNumber !== undefined) {
    // User wants specific number - validate it
    const available = await isNumberAvailable(orgId, entityType, requestedNumber, excludeId);
    if (!available) {
      throw new Error(`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} #${requestedNumber} already exists in this organization`);
    }
    return requestedNumber;
  }

  // Auto-generate next number for this org
  return await getNextNumber(orgId, entityType);
}

/**
 * Format number for display with prefix
 * Examples: CLT-0001, EST-0042, INV-0123
 */
export function formatEntityNumber(entityType: EntityType, number: number): string {
  const prefixes: Record<EntityType, string> = {
    client: 'CLT',
    request: 'REQ',
    estimate: 'EST',
    job: 'JOB',
    invoice: 'INV',
    payment: 'PAY',
    visit: 'VST',
  };

  const prefix = prefixes[entityType];
  return `${prefix}-${number.toString().padStart(4, '0')}`;
}

/**
 * Format number for short display
 * Examples: #1, #42, #123
 */
export function formatShortNumber(number: number): string {
  return `#${number}`;
}
