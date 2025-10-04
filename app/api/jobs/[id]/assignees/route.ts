/**
 * API ENDPOINT: Update Job Assignees
 * PATCH /api/jobs/[id]/assignees
 * 
 * Purpose:
 * Update team assignments for a job and propagate to all visits
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/server/db';
import { withOrgContext } from '@/server/tenancy';

export async function PATCH(
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

    const { id } = await params;
    const { assignees } = await request.json();

    await withOrgContext(selectedOrgId, async () => {
      // Update job assignees
      const job = await prisma.job.update({
        where: { id },
        data: { assignees },
      });

      // Update all visits for this job with the same assignees
      await prisma.visit.updateMany({
        where: { jobId: id },
        data: { assignees },
      });

      return job;
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating job assignees:', error);
    return NextResponse.json({ error: 'Failed to update assignees' }, { status: 500 });
  }
}

