/**
 * API ENDPOINT: Job Line Item Operations
 * PATCH /api/jobs/[id]/line-items/[itemId] - Update line item
 * DELETE /api/jobs/[id]/line-items/[itemId] - Delete line item
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/server/db';
import { withOrgContext } from '@/server/tenancy';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
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

    const { itemId } = await params;
    const data = await request.json();

    const lineItem = await withOrgContext(selectedOrgId, async () => {
      return await prisma.jobLineItem.update({
        where: { id: itemId },
        data: {
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
    console.error('Error updating line item:', error);
    return NextResponse.json({ error: 'Failed to update line item' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
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

    const { itemId } = await params;

    await withOrgContext(selectedOrgId, async () => {
      await prisma.jobLineItem.delete({
        where: { id: itemId },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting line item:', error);
    return NextResponse.json({ error: 'Failed to delete line item' }, { status: 500 });
  }
}

