/**
 * JOB SERVER ACTIONS
 * 
 * Purpose:
 * Server-side business logic for job CRUD operations.
 * Handles job creation with automatic visit generation.
 * 
 * Functions:
 * - createJob: Create new job and generate visits
 * - updateJob: Update existing job details
 * - deleteJob: Remove job and all visits
 * - getJobById: Fetch single job with relations
 * - updateJobStatus: Change job status
 * 
 * Business Logic:
 * - Automatically generates visits based on recurring pattern
 * - Applies team assignments to all visits
 * - Validates input with Zod schemas
 * 
 * ⚠️ MODULAR DESIGN: Keep under 350 lines. Currently at 176 lines ✅
 */

'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '../db';
import { withOrgContext } from '../tenancy';
import { createJobSchema, updateJobSchema, jobStatusUpdateSchema } from '../validators/job';
import { auth } from '@/lib/auth';
import { generateVisitsForJob } from '../utils/visit-generator';
import { serialize } from '@/lib/serialization';
import { getNextNumber } from '../utils/auto-number';

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

export async function createJob(orgId: string, data: unknown) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validatedData = createJobSchema.parse(data);
  
  // Extract fields that need special handling
  const { assignees, lineItems, convertedFromEstimateId, ...jobData } = validatedData;

  return withOrgContext(orgId, async () => {
    const number = await getNextNumber(orgId, 'job');

    // Create the job (without assignees and lineItems)
    const job = await prisma.job.create({
      data: {
        number,
        ...jobData,
        orgId: orgId,
        // Create line items if provided
        ...(lineItems && lineItems.length > 0 && {
          lineItems: {
            create: lineItems.map(item => ({
              name: item.name,
              description: item.description || null,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
              order: item.order,
            })),
          },
        }),
      },
      include: {
        client: true,
        property: true,
        lineItems: true,
      },
    });

    // If client is a LEAD, convert them to ACTIVE (first job = active client)
    if (job.client.clientStatus === 'LEAD') {
      await prisma.client.update({
        where: { id: job.clientId },
        data: {
          clientStatus: 'ACTIVE',
          leadStatus: 'CONVERTED',
        },
      });
      revalidatePath('/clients');
      revalidatePath(`/clients/${job.clientId}`);
    }

    // If converted from estimate, mark estimate as CONVERTED
    if (convertedFromEstimateId) {
      await prisma.estimate.update({
        where: { id: convertedFromEstimateId },
        data: {
          status: 'CONVERTED',
          convertedToJobId: job.id,
        },
      });
      revalidatePath('/estimates');
      revalidatePath(`/estimates/${convertedFromEstimateId}`);
    }

    // Generate visits for the job (one-off or recurring)
    const visits = generateVisitsForJob({
      isRecurring: job.isRecurring,
      recurringPattern: job.recurringPattern,
      recurringDays: Array.isArray(job.recurringDays) ? job.recurringDays as number[] : null,
      startDate: job.startDate,
      startTime: job.startTime,
      recurringEndDate: job.recurringEndDate,
      duration: job.duration, // Duration from job
    });

    // Create all visits in the database with team assignments and line items
    if (visits.length > 0) {
      for (const visit of visits) {
        const visitNumber = await getNextNumber(orgId, 'visit');
        
        const createdVisit = await prisma.visit.create({
          data: {
            number: visitNumber,
            orgId: orgId,
            jobId: job.id,
            scheduledAt: visit.scheduledAt,
            duration: visit.duration,
            status: visit.status,
            assignees: assignees || [],
            // Add line items from job if they exist
            ...(lineItems && lineItems.length > 0 && {
              lineItems: {
                create: lineItems.map(item => ({
                  name: item.name,
                  description: item.description || null,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  total: item.total,
                  order: item.order,
                })),
              },
            }),
          },
        });
      }
    }

    revalidatePath('/jobs');
    revalidatePath('/schedule');
    return serialize(job);
  });
}

export async function updateJob(orgId: string, data: unknown) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validatedData = updateJobSchema.parse(data);
  const { id, clientId, propertyId, assignees, lineItems, ...updateData } = validatedData;

  // Transform relation fields to Prisma's nested format
  const prismaUpdateData: any = { ...updateData };
  if (clientId !== undefined) {
    prismaUpdateData.client = { connect: { id: clientId } };
  }
  if (propertyId !== undefined) {
    if (propertyId === null) {
      prismaUpdateData.property = { disconnect: true };
    } else {
      prismaUpdateData.property = { connect: { id: propertyId } };
    }
  }

  return withOrgContext(orgId, async () => {
    // Update job line items if provided
    if (lineItems && lineItems.length > 0) {
      // Delete existing job line items
      await prisma.jobLineItem.deleteMany({
        where: { jobId: id },
      });
      
      // Create new job line items
      await prisma.jobLineItem.createMany({
        data: lineItems.map(item => ({
          jobId: id,
          name: item.name,
          description: item.description || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          order: item.order,
        })),
      });

      // Sync line items to incomplete visits
      await syncLineItemsToVisits(id, lineItems);
    }

    const job = await prisma.job.update({
      where: { id },
      data: prismaUpdateData,
      include: {
        client: true,
        property: true,
        lineItems: true,
      },
    });

    // If time/duration changed for recurring job, update ALL visits
    if (job.isRecurring && (updateData.startTime !== undefined || updateData.duration !== undefined)) {
      const visitUpdates: any = {};
      
      // Update duration if changed
      if (updateData.duration !== undefined) {
        visitUpdates.duration = updateData.duration;
      }
      
      // Update scheduled times if startTime changed
      if (updateData.startTime !== undefined && job.startTime) {
        // Get all visits for this job
        const visits = await prisma.visit.findMany({
          where: { jobId: id },
          select: { id: true, scheduledAt: true },
        });
        
        // Update each visit's time individually
        const [hours, minutes] = job.startTime.split(':').map(Number);
        for (const visit of visits) {
          const newScheduledAt = new Date(visit.scheduledAt);
          newScheduledAt.setHours(hours, minutes, 0, 0);
          
          await prisma.visit.update({
            where: { id: visit.id },
            data: {
              scheduledAt: newScheduledAt,
              ...(visitUpdates.duration !== undefined && { duration: visitUpdates.duration }),
            },
          });
        }
      } else if (updateData.duration !== undefined) {
        // Just update duration for all visits
        await prisma.visit.updateMany({
          where: { jobId: id },
          data: visitUpdates,
        });
      }
    }

    revalidatePath('/jobs');
    revalidatePath(`/jobs/${id}`);
    return serialize(job);
  });
}

// Helper function to sync job line items to incomplete visits
async function syncLineItemsToVisits(jobId: string, lineItems: any[]) {
  // Get all incomplete visits for this job
  const incompleteVisits = await prisma.visit.findMany({
    where: {
      jobId,
      status: {
        notIn: ['Completed', 'Canceled'],
      },
    },
  });

  // Update each incomplete visit's line items
  for (const visit of incompleteVisits) {
    // Delete existing visit line items
    await prisma.visitLineItem.deleteMany({
      where: { visitId: visit.id },
    });

    // Create new visit line items from job
    await prisma.visitLineItem.createMany({
      data: lineItems.map(item => ({
        visitId: visit.id,
        name: item.name,
        description: item.description || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        order: item.order,
      })),
    });
  }
}

export async function updateJobStatus(orgId: string, data: unknown) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Fetch org to access workflow settings
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
  });
  
  if (!org) {
    throw new Error('Organization not found');
  }

  const validatedData = jobStatusUpdateSchema.parse(data);

  // Validate transition based on organization workflow settings
  const settings = org.settings as Record<string, any>;
  const workflows = settings?.workflows?.jobLifecycle;
  
  if (workflows?.transitions) {
    const currentJob = await withOrgContext(orgId, async () => {
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

  return withOrgContext(orgId, async () => {
    const job = await prisma.job.update({
      where: { id: validatedData.id },
      data: { status: validatedData.status },
      include: {
        client: true,
        property: true,
      },
    });

    revalidatePath('/jobs');
    return job;
  });
}

export async function deleteJob(orgId: string, jobId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return withOrgContext(orgId, async () => {
    // Get visit count for warning
    const visitCount = await prisma.visit.count({
      where: { jobId },
    });

    // Delete job (will cascade to visits)
    await prisma.job.delete({
      where: { id: jobId },
    });

    revalidatePath('/jobs');
    revalidatePath('/schedule');
    
    return { success: true, visitCount };
  });
}

export async function archiveJob(orgId: string, jobId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return withOrgContext(orgId, async () => {
    // Delete incomplete visits
    const deletedCount = await prisma.visit.deleteMany({
      where: {
        jobId,
        status: {
          notIn: ['Completed'],
        },
      },
    });

    // Update job status to Archived
    const job = await prisma.job.update({
      where: { id: jobId },
      data: { status: 'Archived' },
    });

    revalidatePath('/jobs');
    revalidatePath('/schedule');
    revalidatePath(`/jobs/${jobId}`);
    
    return serialize({ ...job, deletedVisits: deletedCount.count });
  });
}

export async function getJobVisitCounts(orgId: string, jobId: string) {
  return withOrgContext(orgId, async () => {
    const total = await prisma.visit.count({ where: { jobId } });
    const completed = await prisma.visit.count({ 
      where: { jobId, status: 'Completed' } 
    });
    const incomplete = total - completed;
    
    return { total, completed, incomplete };
  });
}

