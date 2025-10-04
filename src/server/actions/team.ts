/**
 * TEAM SERVER ACTIONS
 * 
 * Purpose:
 * Server-side business logic for team member management.
 * 
 * Functions:
 * - getTeamMembers: Fetch all team members for organization
 * - inviteTeamMember: Send invitation to join organization
 * - updateMemberRole: Change team member role
 * - removeMember: Remove member from organization
 * 
 * Business Logic:
 * - Manages organization memberships
 * - Sends invitation emails
 * - Enforces role-based permissions
 * 
 * ⚠️ MODULAR DESIGN: Keep under 350 lines. Currently at 183 lines ✅
 */

'use server';

import { prisma } from '../db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/email';

export async function getTeamMembers() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) throw new Error('No organization selected');

  const org = await prisma.organization.findUnique({
    where: { id: selectedOrgId },
    select: { name: true }
  });

  const memberships = await prisma.membership.findMany({
    where: { orgId: selectedOrgId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  return { memberships, orgName: org?.name || 'Your Organization' };
}

export async function inviteTeamMember(data: {
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'STAFF';
}) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) throw new Error('No organization selected');

  // Check if user role allows adding team members
  const currentUserMembership = await prisma.membership.findFirst({
    where: {
      orgId: selectedOrgId,
      user: { email: (session.user as any).email }
    }
  });

  if (!currentUserMembership || !['OWNER', 'ADMIN'].includes(currentUserMembership.role)) {
    throw new Error('Only owners and admins can invite team members');
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    throw new Error('A user with this email already exists');
  }

  const org = await prisma.organization.findUnique({
    where: { id: selectedOrgId },
    select: { name: true }
  });

  // Generate temporary password
  const temporaryPassword = Math.random().toString(36).slice(-10).toUpperCase();
  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash: hashedPassword,
      isSuperAdmin: false,
    }
  });

  // Create membership
  await prisma.membership.create({
    data: {
      userId: user.id,
      orgId: selectedOrgId,
      role: data.role,
    }
  });

  // Send welcome email
  try {
    await sendWelcomeEmail(
      data.email,
      org?.name || 'Your Organization',
      data.name,
      temporaryPassword
    );
  } catch (emailError) {
    console.error('Failed to send welcome email:', emailError);
  }

  revalidatePath('/team');
  return { success: true, temporaryPassword };
}

export async function updateMemberRole(membershipId: string, newRole: 'OWNER' | 'ADMIN' | 'STAFF') {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) throw new Error('No organization selected');

  // Check if current user has permission
  const currentUserMembership = await prisma.membership.findFirst({
    where: {
      orgId: selectedOrgId,
      user: { email: (session.user as any).email }
    }
  });

  if (!currentUserMembership || !['OWNER', 'ADMIN'].includes(currentUserMembership.role)) {
    throw new Error('Only owners and admins can update roles');
  }

  await prisma.membership.update({
    where: { id: membershipId },
    data: { role: newRole }
  });

  revalidatePath('/team');
  return { success: true };
}

export async function removeMember(membershipId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) throw new Error('No organization selected');

  // Check if current user has permission
  const currentUserMembership = await prisma.membership.findFirst({
    where: {
      orgId: selectedOrgId,
      user: { email: (session.user as any).email }
    }
  });

  if (!currentUserMembership || !['OWNER', 'ADMIN'].includes(currentUserMembership.role)) {
    throw new Error('Only owners and admins can remove team members');
  }

  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    include: { user: true }
  });

  if (!membership) {
    throw new Error('Membership not found');
  }

  // Delete membership
  await prisma.membership.delete({
    where: { id: membershipId }
  });

  // Delete user account (one user = one org model)
  await prisma.user.delete({
    where: { id: membership.userId }
  });

  revalidatePath('/team');
  return { success: true };
}
