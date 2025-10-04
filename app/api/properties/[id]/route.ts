/**
 * PROPERTY UPDATE API
 * PATCH /api/properties/[id]
 * 
 * Purpose:
 * Update property details
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { auth } from '@/lib/auth';
import { serialize } from '@/lib/serialization';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const selectedOrgId = (session as any).selectedOrgId;

    if (!selectedOrgId) {
      return NextResponse.json({ error: 'No organization selected' }, { status: 400 });
    }

    const data = await req.json();

    // Update property
    const property = await prisma.property.update({
      where: {
        id,
        orgId: selectedOrgId, // Ensure user can only update their org's properties
      },
      data: {
        address: data.address,
        notes: data.notes,
        custom: data.custom || {},
      },
    });

    return NextResponse.json(serialize(property));
  } catch (error) {
    console.error('Property update error:', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

