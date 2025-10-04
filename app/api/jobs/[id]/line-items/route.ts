/**
 * API ENDPOINT: Job Line Items
 * POST /api/jobs/[id]/line-items - Create new line item
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/server/db';
import { withOrgContext } from '@/server/tenancy';

export async function POST(
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
    const data = await request.json();

    const lineItem = await withOrgContext(selectedOrgId, async () => {
      return await prisma.jobLineItem.create({
        data: {
          jobId,
          name: data.name,
          description: data.description || null,
          quantity: data.quantity,
          unitPrice: data.unitPrice,
          total: data.total,
          order: data.order,
        },
      });
    });

    return NextResponse.json(lineItem);
  } catch (error) {
    console.error('Error creating line item:', error);
    return NextResponse.json({ error: 'Failed to create line item' }, { status: 500 });
  }
}

