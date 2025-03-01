const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function countCategories() {
  try {
    console.log('Counting categories in the database...');
    
    // Count main categories (those without a parent)
    const mainCategoriesCount = await prisma.category.count({
      where: {
        parentId: null
      }
    });
    
    // Count subcategories (those with a parent)
    const subcategoriesCount = await prisma.category.count({
      where: {
        NOT: {
          parentId: null
        }
      }
    });
    
    // Get total count
    const totalCount = await prisma.category.count();
    
    console.log(`Main Categories: ${mainCategoriesCount}`);
    console.log(`Subcategories: ${subcategoriesCount}`);
    console.log(`Total Categories: ${totalCount}`);
    
    // List all main categories with their subcategory counts
    const mainCategories = await prisma.category.findMany({
      where: {
        parentId: null
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });
    
    console.log('\nMain Categories with Subcategory Counts:');
    console.log('----------------------------------------');
    
    for (const category of mainCategories) {
      const subcategoryCount = await prisma.category.count({
        where: {
          parentId: category.id
        }
      });
      
      console.log(`${category.nameEn} (${category.nameAr}): ${subcategoryCount} subcategories`);
    }
    
  } catch (error) {
    console.error('Error counting categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the count
countCategories()
  .catch(error => {
    console.error('Failed to count categories:', error);
    process.exit(1);
  });
