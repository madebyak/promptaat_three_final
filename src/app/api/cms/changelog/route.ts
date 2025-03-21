import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentAdmin } from '@/lib/cms/auth/server-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Schema for creating/updating a changelog
const changelogSchema = z.object({
  titleEn: z.string().min(1, 'English title is required'),
  titleAr: z.string().min(1, 'Arabic title is required'),
  contentEn: z.string().min(1, 'English content is required'),
  contentAr: z.string().min(1, 'Arabic content is required'),
  imageUrl: z.string().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build search conditions
    const searchCondition: Prisma.ChangelogWhereInput = search
      ? {
          deletedAt: null,
          OR: [
            { 
              titleEn: { 
                contains: search, 
                mode: Prisma.QueryMode.insensitive 
              } 
            },
            { 
              titleAr: { 
                contains: search, 
                mode: Prisma.QueryMode.insensitive 
              } 
            },
          ],
        }
      : { deletedAt: null };

    // Get total count for pagination
    const total = await prisma.changelog.count({
      where: searchCondition,
    });

    // Fetch changelogs
    const changelogs = await prisma.changelog.findMany({
      where: searchCondition,
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
      orderBy: {
        publishedAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Calculate total pages
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      changelogs,
      total,
      page,
      limit,
      pages,
    });
  } catch (error) {
    console.error('Error fetching changelogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch changelogs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate admin
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Create new changelog
    const changelog = await prisma.changelog.create({
      data: {
        titleEn,
        titleAr,
        contentEn,
        contentAr,
        imageUrl,
        authorId: admin.id,
        publishedAt: new Date(),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'CREATE',
        entityType: 'CHANGELOG',
        entityId: changelog.id,
        details: { changelog },
      },
    });

    return NextResponse.json(changelog, { status: 201 });
  } catch (error) {
    console.error('Error creating changelog:', error);
    return NextResponse.json(
      { error: 'Failed to create changelog' },
      { status: 500 }
    );
  }
}
