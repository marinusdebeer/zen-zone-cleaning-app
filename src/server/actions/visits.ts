/**
 * VISIT SERVER ACTIONS
 * 
 * Purpose:
 * CRUD operations for visits - independent of jobs
 * 
 * Functions:
 * - getVisit: Fetch single visit with all details
 * - updateVisit: Update visit details (independent of job)
 * - deleteVisit: Delete visit (with invoice protection)
 * - updateVisitStatus: Change visit status
 * 
 * Business Rules:
 * - Editing visit does NOT affect job
 * - Cannot delete visit if it's invoiced
 * - Visits are independent after creation
 */

'use server';

import { auth } from '@/lib/auth';
import { prisma } from '../db';
import { withOrgContext } from '../tenancy';
import { revalidatePath } from 'next/cache';
import { serialize } from '@/lib/serialization';

export async function getVisit(visitId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) {
    throw new Error('No organization selected');
  }

  return withOrgContext(selectedOrgId, async () => {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        job: {
          include: {
            client: true,
            property: true,
          },
        },
        lineItems: {
          orderBy: { order: 'asc' },
        },
        invoice: {
          select: {
            id: true,
            number: true,
            status: true,
          },
        },
      },
    });

    if (!visit) {
      throw new Error('Visit not found');
    }

    return serialize(visit);
  });
}

export async function updateVisit(data: {
  id: string;
  scheduledAt?: Date;
  duration?: number;
  completedAt?: Date | null;
  status?: string;
  assignees?: string[];
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) {
    throw new Error('No organization selected');
  }

  return withOrgContext(selectedOrgId, async () => {
    const { id, ...updateData } = data;

    // Check if visit is invoiced
    const existingVisit = await prisma.visit.findUnique({
      where: { id },
      select: { invoiceId: true, jobId: true },
    });

    if (!existingVisit) {
      throw new Error('Visit not found');
    }

    if (existingVisit.invoiceId) {
      // Only allow certain fields to be updated for invoiced visits
      const allowedFields: any = {};
      if (updateData.notes !== undefined) allowedFields.notes = updateData.notes;
      
      const visit = await prisma.visit.update({
        where: { id },
        data: allowedFields,
        include: {
          lineItems: true,
          invoice: true,
        },
      });

      revalidatePath('/schedule');
      revalidatePath(`/jobs/${existingVisit.jobId}`);
      return serialize(visit);
    }

    // Visit not invoiced - allow all updates
    const visit = await prisma.visit.update({
      where: { id },
      data: updateData,
      include: {
        lineItems: true,
        invoice: true,
        job: {
          select: {
            isRecurring: true,
          },
        },
      },
    });

    // For ONE-OFF jobs, sync visit changes back to the job
    if (!visit.job.isRecurring) {
      const jobUpdateData: any = {};
      
      // Sync time and duration changes
      if (data.scheduledAt) {
        const [hours, minutes] = [
          data.scheduledAt.getHours(),
          data.scheduledAt.getMinutes()
        ];
        jobUpdateData.startDate = data.scheduledAt;
        jobUpdateData.startTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      }
      
      if (data.duration !== undefined) {
        jobUpdateData.duration = data.duration;
      }
      
      // Update the job if there are changes
      if (Object.keys(jobUpdateData).length > 0) {
        await prisma.job.update({
          where: { id: existingVisit.jobId },
          data: jobUpdateData,
        });
      }
    }

    revalidatePath('/schedule');
    revalidatePath(`/jobs/${existingVisit.jobId}`);
    return serialize(visit);
  });
}

export async function deleteVisit(visitId: string, deleteInvoice: boolean = false) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) {
    throw new Error('No organization selected');
  }

  return withOrgContext(selectedOrgId, async () => {
    // Check if visit is invoiced
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      select: { 
        invoiceId: true, 
        jobId: true,
        invoice: {
          select: {
            id: true,
            number: true,
            status: true,
          },
        },
      },
    });

    if (!visit) {
      throw new Error('Visit not found');
    }

    // If visit is invoiced and user confirmed to delete invoice
    if (visit.invoiceId && deleteInvoice) {
      // Delete the invoice (visit will be unlinked via SetNull)
      await prisma.invoice.delete({
        where: { id: visit.invoiceId },
      });
    }

    // Delete visit (line items will cascade)
    await prisma.visit.delete({
      where: { id: visitId },
    });

    revalidatePath('/schedule');
    revalidatePath(`/jobs/${visit.jobId}`);
    if (visit.invoiceId) {
      revalidatePath('/invoices');
      revalidatePath(`/invoices/${visit.invoiceId}`);
    }

    return { 
      success: true, 
      invoiceDeleted: deleteInvoice && !!visit.invoiceId,
      invoice: visit.invoice,
    };
  });
}

export async function getVisitInvoiceInfo(visitId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) {
    throw new Error('No organization selected');
  }

  return withOrgContext(selectedOrgId, async () => {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      select: {
        invoiceId: true,
        invoice: {
          select: {
            id: true,
            number: true,
            status: true,
            _count: {
              select: {
                visits: true,
              },
            },
          },
        },
      },
    });

    return serialize(visit);
  });
}

export async function updateVisitStatus(visitId: string, status: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const selectedOrgId = (session as any).selectedOrgId;
  if (!selectedOrgId) {
    throw new Error('No organization selected');
  }

  return withOrgContext(selectedOrgId, async () => {
    const updateData: any = { status };

    // If marking as completed, set completedAt
    if (status === 'Completed') {
      updateData.completedAt = new Date();
    }

    const visit = await prisma.visit.update({
      where: { id: visitId },
      data: updateData,
      include: {
        job: true,
        lineItems: true,
      },
    });

    revalidatePath('/schedule');
    revalidatePath(`/jobs/${visit.jobId}`);

    return serialize(visit);
  });
}
