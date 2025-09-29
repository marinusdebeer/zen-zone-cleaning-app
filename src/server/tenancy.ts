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
 */
export async function withOrgContext<T>(
  orgId: string,
  fn: () => Promise<T>
): Promise<T> {
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

