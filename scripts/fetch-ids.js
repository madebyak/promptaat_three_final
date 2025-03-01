const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error']
});

async function fetchIds() {
  try {
    console.log('Fetching IDs for categories, subcategories, and tools...');
    
    // Test connection first
    console.log('Testing database connection...');
    const testResult = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('Database connection successful:', testResult);
    
    // Fetch all categories
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        parentId: true
      }
    });
    
    // Separate main categories and subcategories
    const mainCategories = categories.filter(cat => cat.parentId === null);
    const subcategories = categories.filter(cat => cat.parentId !== null);
    
    console.log(`Found ${mainCategories.length} main categories and ${subcategories.length} subcategories`);
    
    // Create lookup maps for categories and subcategories by name
    const categoryMap = {};
    mainCategories.forEach(cat => {
      categoryMap[cat.nameEn] = cat.id;
    });
    
    const subcategoryMap = {};
    subcategories.forEach(subcat => {
      // Create a composite key with parent category name + subcategory name
      // This helps when the same subcategory name appears under different parent categories
      const parentCategory = mainCategories.find(cat => cat.id === subcat.parentId);
      if (parentCategory) {
        const key = `${parentCategory.nameEn}:${subcat.nameEn}`;
        subcategoryMap[key] = {
          id: subcat.id,
          parentId: subcat.parentId
        };
        // Also add a simple key for direct lookup if needed
        subcategoryMap[subcat.nameEn] = {
          id: subcat.id,
          parentId: subcat.parentId
        };
      }
    });
    
    // Fetch all tools
    const tools = await prisma.tool.findMany({
      select: {
        id: true,
        name: true
      }
    });
    
    console.log(`Found ${tools.length} tools`);
    
    // Create lookup map for tools by name
    const toolMap = {};
    tools.forEach(tool => {
      toolMap[tool.name] = tool.id;
    });
    
    // Output the maps to console
    console.log('\nCategory ID Map:');
    console.log(JSON.stringify(categoryMap, null, 2));
    
    console.log('\nSubcategory ID Map:');
    console.log(JSON.stringify(subcategoryMap, null, 2));
    
    console.log('\nTool ID Map:');
    console.log(JSON.stringify(toolMap, null, 2));
    
    // Return the maps
    return {
      categories: categoryMap,
      subcategories: subcategoryMap,
      tools: toolMap
    };
    
  } catch (error) {
    console.error('Error fetching IDs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// If this script is run directly, execute the fetchIds function
if (require.main === module) {
  fetchIds()
    .catch((error) => {
      console.error('Failed to fetch IDs:', error);
      process.exit(1);
    });
} else {
  // Export the function for use in other scripts
  module.exports = { fetchIds };
}
