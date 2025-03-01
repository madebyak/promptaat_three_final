import { prisma } from '@/lib/db'

export async function getCategories(locale: string = 'en') {
  const categories = await prisma.category.findMany({
    where: {
      deletedAt: null,
      parentId: null
    },
    orderBy: {
      sortOrder: 'asc'
    },
    include: {
      _count: {
        select: {
          promptCategories: true,
          children: true
        }
      },
      children: {
        where: {
          deletedAt: null
        },
        orderBy: {
          sortOrder: 'asc'
        },
        include: {
          _count: {
            select: {
              promptCategories: true,
              children: true
            }
          }
        }
      }
    }
  })

  return categories.map(category => ({
    id: category.id,
    name: locale === 'ar' ? category.nameAr : category.nameEn,
    nameEn: category.nameEn,
    nameAr: category.nameAr,
    iconName: category.iconName,
    sortOrder: category.sortOrder,
    _count: category._count,
    subcategories: category.children.map(child => ({
      id: child.id,
      name: locale === 'ar' ? child.nameAr : child.nameEn,
      nameEn: child.nameEn,
      nameAr: child.nameAr,
      iconName: child.iconName,
      sortOrder: child.sortOrder,
      parentId: child.parentId,
      _count: child._count
    }))
  }))
}

export async function searchCategories(query: string, locale: string = 'en') {
  const categories = await prisma.category.findMany({
    where: {
      deletedAt: null,
      OR: [
        { nameEn: { contains: query, mode: 'insensitive' } },
        { nameAr: { contains: query, mode: 'insensitive' } }
      ]
    },
    orderBy: {
      sortOrder: 'asc'
    },
    include: {
      _count: {
        select: {
          promptCategories: true,
          children: true
        }
      }
    }
  })

  return categories.map(category => ({
    id: category.id,
    name: locale === 'ar' ? category.nameAr : category.nameEn,
    nameEn: category.nameEn,
    nameAr: category.nameAr,
    iconName: category.iconName,
    sortOrder: category.sortOrder,
    parentId: category.parentId,
    _count: category._count
  }))
}
