/**
 * MULTI-TENANCY UTILITIES
 * 
 * Purpose:
 * Utilities for managing multi-tenant data isolation.
 * Ensures users only access their organization's data.
 * 
 * Functions:
 * - setTenantContext: Set current organization ID for RLS
 * - withOrgContext: Execute function within organization context
 * - getOrgBySlug: Fetch organization by URL slug
 * - getUserOrganizations: Get all orgs a user belongs to
 * - getUserMembership: Get user's membership in specific org
 * 
 * Business Logic:
 * - Uses PostgreSQL session variables for RLS
 * - All queries automatically filtered by organization
 * - Prevents cross-tenant data access
 * 
 * Critical Security:
 * - Always use withOrgContext for data operations
 * - Never bypass tenant context
 */

import { prisma } from './db';
import { Organization } from '@/generated/prisma';

/**
 * Sets the tenant context for Row Level Security
 */
export async function setTenantContext(orgId: string): Promise<void> {
  await prisma.$executeRaw`SELECT set_config('app.org_id', ${orgId}, true)`;
}

/**
 * Gets organization by slug
 */
export async function getOrgBySlug(slug: string): Promise<Organization | null> {
  return await prisma.organization.findUnique({
    where: { slug },
  });
}

/**
 * Executes a function within a tenant context
 * SECURITY: Validates user has access to the organization
 */
export async function withOrgContext<T>(
  orgId: string,
  fn: () => Promise<T>
): Promise<T> {
  // CRITICAL: Validate user has membership in this organization
  const { auth } = await import('@/lib/auth');
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized: No active session');
  }
  
  // Super admins can access any organization
  if ((session.user as any).isSuperAdmin) {
    await setTenantContext(orgId);
    return await fn();
  }
  
  // Regular users: Verify membership
  const membership = await prisma.membership.findUnique({
    where: {
      userId_orgId: {
        userId: session.user.id,
        orgId: orgId,
      },
    },
  });
  
  if (!membership) {
    throw new Error('Unauthorized: User does not have access to this organization');
  }
  
  await setTenantContext(orgId);
  return await fn();
}

/**
 * Gets organization with all memberships for a user
 */
export async function getUserOrganizations(userId: string) {
  return await prisma.organization.findMany({
    where: {
      memberships: {
        some: {
          userId,
        },
      },
    },
    include: {
      memberships: {
        where: {
          userId,
        },
        select: {
          role: true,
        },
      },
    },
  });
}

/**
 * Gets user membership for a specific organization
 */
export async function getUserMembership(userId: string, orgId: string) {
  return await prisma.membership.findUnique({
    where: {
      userId_orgId: {
        userId,
        orgId,
      },
    },
    include: {
      org: true,
    },
  });
}

