import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/cms/auth/server-auth';

// GET all categories with proper hierarchy
export async function GET(request: NextRequest) {
  try {
    // Authenticate admin
    const admin = await getCurrentAdmin();
    
    // In production, ensure admin is authenticated
    if (!admin && process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized' 
        },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const parentId = searchParams.get('parentId'); // Can be used to filter by parent
    const includeDeleted = searchParams.get('includeDeleted') === 'true';
    
    // Base query conditions
    const whereConditions: any = {};
    
    // Handle soft-deleted items
    if (!includeDeleted) {
      whereConditions.deletedAt = null;
    }
    
    // Handle search query
    if (query) {
      whereConditions.OR = [
        { nameEn: { contains: query, mode: 'insensitive' } },
        { nameAr: { contains: query, mode: 'insensitive' } },
      ];
    }
    
    // Handle parent filtering
    if (parentId !== null && parentId !== undefined) {
      whereConditions.parentId = parentId === 'null' ? null : parentId;
    }

    // Fetch categories
    const categories = await prisma.category.findMany({
      where: whereConditions,
      orderBy: {
        sortOrder: 'asc',
      },
      include: {
        _count: {
          select: {
            promptCategories: true,
            children: true,
          },
        },
        parent: {
          select: {
            id: true,
            nameEn: true,
            nameAr: true,
          },
        },
        children: {
          where: { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: {
              select: {
                promptCategories: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Categories fetched successfully',
      data: categories,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('[CMS Categories API Error]:', error);
      
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch categories',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 500 }
      );
    }
    console.error('[CMS Categories API Error]:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch categories',
        error: process.env.NODE_ENV === 'development' ? 'Unknown error' : undefined,
      },
      { status: 500 }
    );
  }
}

// CREATE a new category
export async function POST(request: NextRequest) {
  try {
    // Authenticate admin
    const admin = await getCurrentAdmin();
    
    // In production, ensure admin is authenticated
    if (!admin && process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized' 
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { nameEn, nameAr, iconName, parentId, sortOrder } = body;
    
    // Validate required fields
    if (!nameEn || !nameAr || !iconName) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // If parentId is provided, check if parent exists
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      });
      
      if (!parentCategory) {
        return NextResponse.json(
          {
            success: false,
            message: 'Parent category not found',
          },
          { status: 404 }
        );
      }
    }

    // Determine sort order if not provided
    let finalSortOrder = sortOrder;
    if (finalSortOrder === undefined) {
      const lastCategory = await prisma.category.findFirst({
        where: { 
          parentId: parentId || null,
          deletedAt: null,
        },
        orderBy: { sortOrder: 'desc' },
      });
      
      finalSortOrder = lastCategory ? lastCategory.sortOrder + 1 : 0;
    }

    // Create new category
    const newCategory = await prisma.category.create({
      data: {
        nameEn,
        nameAr,
        iconName,
        parentId: parentId || null,
        sortOrder: finalSortOrder,
      },
    });

    // Create audit log
    if (admin) {
      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          action: 'create',
          entityType: 'category',
          entityId: newCategory.id,
          details: {
            nameEn,
            nameAr,
            iconName,
            parentId: parentId || null,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      data: newCategory,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('[CMS Categories API Error]:', error);
      
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create category',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 500 }
      );
    }
    console.error('[CMS Categories API Error]:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create category',
        error: process.env.NODE_ENV === 'development' ? 'Unknown error' : undefined,
      },
      { status: 500 }
    );
  }
}

// UPDATE an existing category
export async function PUT(request: NextRequest) {
  try {
    // Authenticate admin
    const admin = await getCurrentAdmin();
    
    // In production, ensure admin is authenticated
    if (!admin && process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized' 
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { id, nameEn, nameAr, iconName, parentId, sortOrder } = body;
    
    // Validate required fields
    if (!id || !nameEn || !nameAr || !iconName) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });
    
    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: 'Category not found',
        },
        { status: 404 }
      );
    }

    // If parentId is provided, check if parent exists
    if (parentId) {
      // Prevent circular reference
      if (parentId === id) {
        return NextResponse.json(
          {
            success: false,
            message: 'Category cannot be its own parent',
          },
          { status: 400 }
        );
      }
      
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      });
      
      if (!parentCategory) {
        return NextResponse.json(
          {
            success: false,
            message: 'Parent category not found',
          },
          { status: 404 }
        );
      }
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        nameEn,
        nameAr,
        iconName,
        parentId: parentId || null,
        sortOrder: sortOrder !== undefined ? sortOrder : existingCategory.sortOrder,
      },
    });

    // Create audit log
    if (admin) {
      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          action: 'update',
          entityType: 'category',
          entityId: id,
          details: {
            nameEn,
            nameAr,
            iconName,
            parentId: parentId || null,
            sortOrder,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('[CMS Categories API Error]:', error);
      
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to update category',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 500 }
      );
    }
    console.error('[CMS Categories API Error]:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update category',
        error: process.env.NODE_ENV === 'development' ? 'Unknown error' : undefined,
      },
      { status: 500 }
    );
  }
}

// DELETE a category (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate admin
    const admin = await getCurrentAdmin();
    
    // In production, ensure admin is authenticated
    if (!admin && process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized' 
        },
        { status: 401 }
      );
    }

    // Get category ID from URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Category ID is required',
        },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        children: {
          where: { deletedAt: null },
        },
      },
    });
    
    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: 'Category not found',
        },
        { status: 404 }
      );
    }

    // Check for associated subcategories
    if (existingCategory.children.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cannot delete a category that has subcategories',
        },
        { status: 400 }
      );
    }

    // Soft delete the category
    const deletedCategory = await prisma.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // Create audit log
    if (admin) {
      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          action: 'delete',
          entityType: 'category',
          entityId: id,
          details: { id },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
      data: deletedCategory,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('[CMS Categories API Error]:', error);
      
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to delete category',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 500 }
      );
    }
    console.error('[CMS Categories API Error]:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete category',
        error: process.env.NODE_ENV === 'development' ? 'Unknown error' : undefined,
      },
      { status: 500 }
    );
  }
}

// UPDATE many categories (for reordering)
export async function PATCH(request: NextRequest) {
  try {
    // Authenticate admin
    const admin = await getCurrentAdmin();
    
    // In production, ensure admin is authenticated
    if (!admin && process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized' 
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { categories } = body;
    
    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid categories data',
        },
        { status: 400 }
      );
    }

    // Update categories in a transaction
    const result = await prisma.$transaction(
      categories.map(({ id, sortOrder }) =>
        prisma.category.update({
          where: { id },
          data: { sortOrder },
        })
      )
    );

    // Create audit log
    if (admin) {
      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          action: 'update',
          entityType: 'category',
          entityId: 'batch',
          details: { operation: 'reorder', categories },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Categories updated successfully',
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('[CMS Categories API Error]:', error);
      
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to update categories',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 500 }
      );
    }
    console.error('[CMS Categories API Error]:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update categories',
        error: process.env.NODE_ENV === 'development' ? 'Unknown error' : undefined,
      },
      { status: 500 }
    );
  }
}