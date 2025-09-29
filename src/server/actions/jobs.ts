'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '../db';
import { withOrgContext, getOrgBySlug } from '../tenancy';
import { createJobSchema, updateJobSchema, jobStatusUpdateSchema } from '../validators/job';
import { auth } from '@/lib/auth';

export async function getJobs(orgId: string) {
  return withOrgContext(orgId, async () => {
    return await prisma.job.findMany({
      include: {
        client: true,
        property: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  });
}

export async function getJob(orgId: string, jobId: string) {
  return withOrgContext(orgId, async () => {
    return await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        client: true,
        property: true,
        lineItems: true,
        invoices: true,
      },
    });
  });
}

export async function createJob(orgSlug: string, data: unknown) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const org = await getOrgBySlug(orgSlug);
  if (!org) {
    throw new Error('Organization not found');
  }

  const validatedData = createJobSchema.parse(data);

  return withOrgContext(org.id, async () => {
    const job = await prisma.job.create({
      data: {
        ...validatedData,
        orgId: org.id,
      },
      include: {
        client: true,
        property: true,
      },
    });

    revalidatePath(`/t/${orgSlug}/jobs`);
    return job;
  });
}

export async function updateJob(orgId: string, data: unknown) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validatedData = updateJobSchema.parse(data);
  const { id, ...updateData } = validatedData;

  return withOrgContext(orgId, async () => {
    const job = await prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        property: true,
      },
    });

    revalidatePath(`/t/${orgId}/jobs`);
    return job;
  });
}

export async function updateJobStatus(orgSlug: string, data: unknown) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const org = await getOrgBySlug(orgSlug);
  if (!org) {
    throw new Error('Organization not found');
  }

  const validatedData = jobStatusUpdateSchema.parse(data);

  // Validate transition based on organization workflow settings
  const settings = org.settings as Record<string, any>;
  const workflows = settings?.workflows?.jobLifecycle;
  
  if (workflows?.transitions) {
    const currentJob = await withOrgContext(org.id, async () => {
      return await prisma.job.findUnique({
        where: { id: validatedData.id },
        select: { status: true },
      });
    });

    if (currentJob) {
      const allowedTransitions = workflows.transitions[currentJob.status] || [];
      if (!allowedTransitions.includes(validatedData.status)) {
        throw new Error(`Invalid status transition from ${currentJob.status} to ${validatedData.status}`);
      }
    }
  }

  return withOrgContext(org.id, async () => {
    const job = await prisma.job.update({
      where: { id: validatedData.id },
      data: { status: validatedData.status },
      include: {
        client: true,
        property: true,
      },
    });

    revalidatePath(`/t/${orgSlug}/jobs`);
    return job;
  });
}

export async function deleteJob(orgId: string, jobId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return withOrgContext(orgId, async () => {
    await prisma.job.delete({
      where: { id: jobId },
    });

    revalidatePath(`/t/${orgId}/jobs`);
  });
}

