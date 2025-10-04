/**
 * API ENDPOINT: Bulk Update Job Expenses
 * PUT /api/jobs/[id]/expenses
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
    const { expenses } = await request.json();

    await withOrgContext(selectedOrgId, async () => {
      // Delete all existing expenses
      await prisma.expense.deleteMany({
        where: { jobId },
      });

      // Create new expenses
      if (expenses && expenses.length > 0) {
        await prisma.expense.createMany({
          data: expenses.map((expense: any) => ({
            jobId,
            date: new Date(expense.date),
            category: expense.category,
            description: expense.description || null,
            amount: expense.amount,
            receiptUrl: expense.receiptUrl || null,
          })),
        });
      }
    });

    revalidatePath(`/jobs/${jobId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating expenses:', error);
    return NextResponse.json({ error: 'Failed to update expenses' }, { status: 500 });
  }
}

