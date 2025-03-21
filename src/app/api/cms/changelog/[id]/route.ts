import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentAdmin } from '@/lib/cms/auth/server-auth';
import { z } from 'zod';

// Schema for updating a changelog
const changelogSchema = z.object({
  titleEn: z.string().min(1, 'English title is required'),
  titleAr: z.string().min(1, 'Arabic title is required'),
  contentEn: z.string().min(1, 'English content is required'),
  contentAr: z.string().min(1, 'Arabic content is required'),
  imageUrl: z.string().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate admin
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Fetch changelog
    const changelog = await prisma.changelog.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!changelog) {
      return NextResponse.json({ error: 'Changelog not found' }, { status: 404 });
    }

    return NextResponse.json(changelog);
  } catch (error) {
    console.error('Error fetching changelog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch changelog' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate admin
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Check if changelog exists
    const existingChangelog = await prisma.changelog.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingChangelog) {
      return NextResponse.json({ error: 'Changelog not found' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = changelogSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { titleEn, titleAr, contentEn, contentAr, imageUrl } = validationResult.data;

    // Update changelog
    const updatedChangelog = await prisma.changelog.update({
      where: { id },
      data: {
        titleEn,
        titleAr,
        contentEn,
        contentAr,
        imageUrl,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'UPDATE',
        entityType: 'CHANGELOG',
        entityId: id,
        details: { 
          before: existingChangelog,
          after: updatedChangelog 
        },
      },
    });

    return NextResponse.json(updatedChangelog);
  } catch (error) {
    console.error('Error updating changelog:', error);
    return NextResponse.json(
      { error: 'Failed to update changelog' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate admin
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Check if changelog exists
    const existingChangelog = await prisma.changelog.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingChangelog) {
      return NextResponse.json({ error: 'Changelog not found' }, { status: 404 });
    }

    // Soft delete changelog
    const deletedChangelog = await prisma.changelog.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'DELETE',
        entityType: 'CHANGELOG',
        entityId: id,
        details: { changelog: existingChangelog },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting changelog:', error);
    return NextResponse.json(
      { error: 'Failed to delete changelog' },
      { status: 500 }
    );
  }
}
