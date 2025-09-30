'use server';

import { prisma } from '../db';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { sendPasswordResetEmail, sendWelcomeEmail } from '@/lib/email';

export async function createOrganization(data: {
  name: string;
  slug: string;
  industry: string;
  ownerName: string;
  ownerEmail: string;
}) {
  const session = await auth();
  
  // Check if super admin
  const user = session?.user as any;
  if (!user?.isSuperAdmin) {
    throw new Error('Unauthorized: Only super admins can create organizations');
  }

  // Check if slug is unique
  const existingOrg = await prisma.organization.findUnique({
    where: { slug: data.slug },
  });

  if (existingOrg) {
    throw new Error('Organization with this slug already exists');
  }

  // Check if owner email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.ownerEmail },
  });

  if (existingUser) {
    throw new Error('A user with this email already exists');
  }

  // Create organization
  const organization = await prisma.organization.create({
    data: {
      name: data.name,
      slug: data.slug,
      industry: data.industry,
      settings: {
        features: {
          quotes: true,
          invoices: true,
        },
      },
    },
  });

  // Generate temporary password
  const temporaryPassword = Math.random().toString(36).slice(-10).toUpperCase();
  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
  
  // Create owner user
  const owner = await prisma.user.create({
    data: {
      email: data.ownerEmail,
      name: data.ownerName,
      passwordHash: hashedPassword,
      isSuperAdmin: false,
    },
  });

  // Create membership
  await prisma.membership.create({
    data: {
      userId: owner.id,
      orgId: organization.id,
      role: 'OWNER',
    },
  });

  // Send welcome email with credentials
  try {
    await sendWelcomeEmail(
      data.ownerEmail,
      data.name,
      data.ownerName,
      temporaryPassword
    );
    console.log('✅ Welcome email sent to:', data.ownerEmail);
  } catch (emailError) {
    console.error('⚠️  Failed to send welcome email:', emailError);
    console.error('Error details:', emailError);
    // Don't fail the entire operation if email fails
  }

  revalidatePath('/admin');
  
  return {
    organization,
    owner,
    temporaryPassword,
  };
}

export async function updateUserRole(membershipId: string, newRole: 'OWNER' | 'ADMIN' | 'STAFF') {
  const session = await auth();
  const user = session?.user as any;
  if (!user?.isSuperAdmin) {
    throw new Error('Unauthorized');
  }

  await prisma.membership.update({
    where: { id: membershipId },
    data: { role: newRole },
  });

  revalidatePath('/admin');
}

export async function removeUserFromOrg(membershipId: string) {
  const session = await auth();
  const user = session?.user as any;
  if (!user?.isSuperAdmin) {
    throw new Error('Unauthorized');
  }

  // Get membership to find user
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    include: { user: true },
  });

  if (!membership) {
    throw new Error('Membership not found');
  }

  // Delete membership
  await prisma.membership.delete({
    where: { id: membershipId },
  });

  // Also delete the user account (since users should only belong to one org)
  // This prevents security issues with users accessing multiple organizations
  await prisma.user.delete({
    where: { id: membership.userId },
  });

  revalidatePath('/admin');
  
  return { message: 'User removed and account deleted' };
}

export async function sendPasswordReset(userEmail: string) {
  const session = await auth();
  const user = session?.user as any;
  if (!user?.isSuperAdmin) {
    throw new Error('Unauthorized');
  }

  // Find the user
  const targetUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!targetUser) {
    throw new Error('User not found');
  }

  // Generate temporary password
  const temporaryPassword = Math.random().toString(36).slice(-10).toUpperCase();
  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

  // Update user password
  await prisma.user.update({
    where: { email: userEmail },
    data: { passwordHash: hashedPassword },
  });

  // Send password reset email
  try {
    await sendPasswordResetEmail(
      userEmail,
      targetUser.name,
      temporaryPassword
    );
    console.log('✅ Password reset email sent to:', userEmail);
    return { 
      success: true, 
      message: 'Password reset email sent successfully',
      temporaryPassword, // Return for admin to see
    };
  } catch (emailError) {
    console.error('❌ Failed to send password reset email:', emailError);
    // Password was still reset in database
    return {
      success: false,
      message: 'Password was reset but email failed to send',
      temporaryPassword, // Return so admin can manually share
      error: emailError instanceof Error ? emailError.message : 'Unknown error',
    };
  }
}

export async function getOrganizationForEdit(orgId: string) {
  const session = await auth();
  const user = session?.user as any;
  if (!user?.isSuperAdmin) {
    throw new Error('Unauthorized');
  }

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      id: true,
      name: true,
      slug: true,
      industry: true,
      createdAt: true,
    },
  });

  if (!org) {
    throw new Error('Organization not found');
  }

  return org;
}

export async function updateOrganization(
  orgId: string,
  data: { name: string; slug: string; industry: string }
) {
  const session = await auth();
  const user = session?.user as any;
  if (!user?.isSuperAdmin) {
    throw new Error('Unauthorized');
  }

  // Validate slug format
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(data.slug)) {
    throw new Error('Slug can only contain lowercase letters, numbers, and hyphens');
  }

  // Check if slug is already taken by another organization
  const existingOrg = await prisma.organization.findFirst({
    where: {
      slug: data.slug,
      id: { not: orgId },
    },
  });

  if (existingOrg) {
    throw new Error('This slug is already in use by another organization');
  }

  // Update organization
  const updated = await prisma.organization.update({
    where: { id: orgId },
    data: {
      name: data.name,
      slug: data.slug,
      industry: data.industry,
    },
  });

  revalidatePath('/admin');
  revalidatePath(`/admin/organizations/${orgId}`);
  
  return updated;
}

export async function addUserToOrg(data: {
  orgId: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'STAFF';
}) {
  const session = await auth();
  const user = session?.user as any;
  if (!user?.isSuperAdmin) {
    throw new Error('Unauthorized: Only super admins can add users');
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('A user with this email already exists');
  }

  // Get organization details for welcome email
  const organization = await prisma.organization.findUnique({
    where: { id: data.orgId },
    select: { name: true },
  });

  if (!organization) {
    throw new Error('Organization not found');
  }

  // Generate temporary password
  const temporaryPassword = Math.random().toString(36).slice(-10).toUpperCase();
  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

  // Create user
  const newUser = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash: hashedPassword,
      isSuperAdmin: false,
    },
  });

  // Create membership
  await prisma.membership.create({
    data: {
      userId: newUser.id,
      orgId: data.orgId,
      role: data.role,
    },
  });

  // Send welcome email
  try {
    await sendWelcomeEmail(
      data.email,
      organization.name,
      data.name,
      temporaryPassword
    );
    console.log('✅ Welcome email sent to:', data.email);
  } catch (emailError) {
    console.error('⚠️  Failed to send welcome email:', emailError);
    // Don't fail the entire operation if email fails
  }

  revalidatePath('/admin');
  revalidatePath(`/admin/organizations/${data.orgId}`);

  return {
    user: newUser,
    temporaryPassword,
    success: true,
  };
}
