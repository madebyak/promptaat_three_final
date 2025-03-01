const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Initialize Prisma with more detailed logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});

async function uploadCategories() {
  try {
    console.log('Starting category upload process...');
    
    // Test connection first
    console.log('Testing database connection...');
    const testResult = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('Database connection successful:', testResult);
    
    // Get all JSON files from the data-entry directory that match our pattern
    const dataDir = path.join(__dirname, '..', 'data-entry');
    const files = fs.readdirSync(dataDir)
      .filter(file => file.startsWith('categories-') && file.endsWith('.json'));
    
    console.log(`Found ${files.length} category files to process`);
    
    // Process each file
    for (const file of files) {
      const filePath = path.join(dataDir, file);
      console.log(`Processing file: ${file}`);
      
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      
      // Process each main category
      for (const category of data.categories) {
        console.log(`Creating main category: ${category.nameEn}`);
        
        try {
          // Create the main category
          const mainCategory = await prisma.category.create({
            data: {
              nameEn: category.nameEn,
              nameAr: category.nameAr,
              iconName: category.iconName,
              sortOrder: category.sortOrder
            }
          });
          
          // Process subcategories
          if (category.subcategories && category.subcategories.length > 0) {
            for (const subcategory of category.subcategories) {
              console.log(`  Creating subcategory: ${subcategory.nameEn}`);
              
              try {
                // Create the subcategory with a reference to the parent
                await prisma.category.create({
                  data: {
                    nameEn: subcategory.nameEn,
                    nameAr: subcategory.nameAr,
                    iconName: category.iconName, // Use the same icon as the parent
                    sortOrder: subcategory.sortOrder,
                    parentId: mainCategory.id
                  }
                });
              } catch (subcategoryError) {
                console.error(`  Error creating subcategory ${subcategory.nameEn}:`, subcategoryError);
              }
            }
          }
        } catch (categoryError) {
          console.error(`Error creating category ${category.nameEn}:`, categoryError);
        }
      }
    }
    
    console.log('Category upload completed successfully!');
  } catch (error) {
    console.error('Error during category upload:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the upload
uploadCategories()
  .catch((error) => {
    console.error('Failed to upload categories:', error);
    process.exit(1);
  });
