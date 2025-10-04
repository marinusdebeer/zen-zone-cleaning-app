/**
 * REQUEST IMAGES EXTRACTION API
 * 
 * GET /api/requests/[id]/images
 * 
 * Purpose:
 * Download zip archive with HTTP Basic Auth, extract images, return URLs
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { auth } from '@/lib/auth';
import AdmZip from 'adm-zip';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const selectedOrgId = (session as any).selectedOrgId;

    // Get request with images data
    const request = await prisma.request.findUnique({
      where: { id, orgId: selectedOrgId },
      select: { details: true },
    });

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const details = request.details as any;
    const images = details?.images;

    if (!images?.archiveLink) {
      return NextResponse.json({ images: [] }, { status: 200 });
    }

    // Download zip with HTTP Basic Auth
    const authUsers = process.env.AUTHORIZED_USERS;
    if (!authUsers) {
      return NextResponse.json(
        { error: 'Image authentication not configured' },
        { status: 500 }
      );
    }
    
    const [username, password] = authUsers.split(',')[0].split(':');
    
    const authHeader = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
    
    const response = await fetch(images.archiveLink, {
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download archive: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract zip
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();

    // Filter image files and convert to data URLs
    const imageFiles = zipEntries.filter(entry => 
      !entry.isDirectory && 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(entry.entryName)
    );

    const extractedImages = imageFiles.map(entry => {
      const data = entry.getData();
      const base64 = data.toString('base64');
      const ext = entry.entryName.split('.').pop()?.toLowerCase();
      const mimeType = ext === 'png' ? 'image/png' : 
                      ext === 'gif' ? 'image/gif' :
                      ext === 'webp' ? 'image/webp' : 'image/jpeg';
      
      return {
        name: entry.entryName.split('/').pop(),
        dataUrl: `data:${mimeType};base64,${base64}`,
        size: entry.header.size,
      };
    });

    return NextResponse.json({
      images: extractedImages,
      count: extractedImages.length,
      folder: images.folder,
    });

  } catch (error) {
    console.error('Image extraction error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to extract images',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

