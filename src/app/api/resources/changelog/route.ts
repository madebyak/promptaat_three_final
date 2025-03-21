import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const id = searchParams.get('id');

    // If ID is provided, return a single changelog entry
    if (id) {
      const changelog = await prisma.changelog.findUnique({
        where: {
          id: id, // Fix: Added id: before id
          deletedAt: null,
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!changelog) {
        return NextResponse.json({ error: 'Changelog not found' }, { status: 404 });
      }

      return NextResponse.json(changelog);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await prisma.changelog.count({
      where: {
        deletedAt: null,
      },
    });

    // Fetch changelogs
    const changelogs = await prisma.changelog.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
