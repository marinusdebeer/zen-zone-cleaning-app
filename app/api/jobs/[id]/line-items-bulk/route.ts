/**
 * API ENDPOINT: Bulk Update Job Line Items
 * PUT /api/jobs/[id]/line-items-bulk
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/server/db';
import { withOrgContext } from '@/server/tenancy';
import { revalidatePath } from 'next/cache';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const selectedOrgId = (session as any).selectedOrgId;
    if (!selectedOrgId) {
      return NextResponse.json({ error: 'No organization selected' }, { status: 400 });
    }

    const { id: jobId } = await params;
    const { lineItems } = await request.json();

    await withOrgContext(selectedOrgId, async () => {
      // Delete all existing line items
      await prisma.jobLineItem.deleteMany({
        where: { jobId },
      });

      // Create new line items
      if (lineItems && lineItems.length > 0) {
        await prisma.jobLineItem.createMany({
          data: lineItems.map((item: any, index: number) => ({
            jobId,
            name: item.name,
            description: item.description || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
            order: index,
          })),
        });
      }
    });

    revalidatePath(`/jobs/${jobId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating line items:', error);
    return NextResponse.json({ error: 'Failed to update line items' }, { status: 500 });
  }
}

