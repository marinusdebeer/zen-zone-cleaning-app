'use server';

import { prisma } from '../db';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function updateOrganizationInfo(data: {
  name: string;
  industry: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  taxRate?: number;
  currency?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) throw new Error('No organization selected');

  // Update organization
  await prisma.organization.update({
    where: { id: selectedOrgId },
    data: {
      name: data.name,
      industry: data.industry,
      settings: {
        ...((await prisma.organization.findUnique({
          where: { id: selectedOrgId },
          select: { settings: true }
        }))?.settings || {}),
        contact: {
          phone: data.phone,
          email: data.email,
          address: data.address,
          website: data.website,
        },
        financial: {
          taxRate: data.taxRate,
          currency: data.currency || 'USD',
        },
      },
    },
  });

  revalidatePath('/settings');
  return { success: true };
}

export async function updateBusinessHours(businessHours: {
  monday?: { open: string; close: string; isOpen: boolean };
  tuesday?: { open: string; close: string; isOpen: boolean };
  wednesday?: { open: string; close: string; isOpen: boolean };
  thursday?: { open: string; close: string; isOpen: boolean };
  friday?: { open: string; close: string; isOpen: boolean };
  saturday?: { open: string; close: string; isOpen: boolean };
  sunday?: { open: string; close: string; isOpen: boolean };
}) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) throw new Error('No organization selected');

  const org = await prisma.organization.findUnique({
    where: { id: selectedOrgId },
    select: { settings: true }
  });

  await prisma.organization.update({
    where: { id: selectedOrgId },
    data: {
      settings: {
        ...(org?.settings || {}),
        businessHours,
      },
    },
  });

  revalidatePath('/settings');
  return { success: true };
}

export async function updateServices(services: { name: string; description?: string; defaultPrice?: number }[]) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) throw new Error('No organization selected');

  const org = await prisma.organization.findUnique({
    where: { id: selectedOrgId },
    select: { settings: true }
  });

  await prisma.organization.update({
    where: { id: selectedOrgId },
    data: {
      settings: {
        ...(org?.settings || {}),
        services,
      },
    },
  });

  revalidatePath('/settings');
  return { success: true };
}

export async function updateBranding(branding: {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  logo?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) throw new Error('No organization selected');

  const org = await prisma.organization.findUnique({
    where: { id: selectedOrgId },
    select: { settings: true }
  });

  await prisma.organization.update({
    where: { id: selectedOrgId },
    data: {
      settings: {
        ...(org?.settings || {}),
        branding,
      },
    },
  });

  revalidatePath('/settings');
  return { success: true };
}

export async function updateUserProfile(data: {
  name: string;
  email: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const userId = (session.user as any).id;
  if (!userId) throw new Error('User ID not found');

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      email: data.email,
    },
  });

  revalidatePath('/settings');
  return { success: true };
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const userId = (session.user as any).id;
  if (!userId) throw new Error('User ID not found');

  // Get current user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user) throw new Error('User not found');

  // Verify current password
  const isValidPassword = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!isValidPassword) {
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(data.newPassword, 10);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashedPassword },
  });

  return { success: true };
}

export async function getOrganizationSettings() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) throw new Error('No organization selected');

  const org = await prisma.organization.findUnique({
    where: { id: selectedOrgId },
    select: {
      id: true,
      name: true,
      slug: true,
      industry: true,
      settings: true,
      createdAt: true,
    },
  });

  return org;
}
