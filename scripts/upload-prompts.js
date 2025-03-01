const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { preparePrompts } = require('./prepare-prompts');

const prisma = new PrismaClient({
  log: ['error']
});

async function uploadPrompts() {
  try {
    console.log('Starting prompts upload process...');
    
    // Test connection first
    console.log('Testing database connection...');
    const testResult = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('Database connection successful:', testResult);
    
    // Check if we need to prepare the prompts first or use existing processed file
    let prompts;
    const processedFilePath = path.join(__dirname, '..', 'data-entry', 'processed-prompts.json');
    
    if (fs.existsSync(processedFilePath)) {
      console.log(`Reading processed prompts from: ${processedFilePath}`);
      const fileContent = fs.readFileSync(processedFilePath, 'utf8');
      prompts = JSON.parse(fileContent).prompts;
    } else {
      console.log('Processed prompts file not found. Preparing prompts data...');
      prompts = await preparePrompts();
    }
    
    console.log(`Found ${prompts.length} prompts to upload`);
    
    // Process each prompt
    for (const [index, prompt] of prompts.entries()) {
      console.log(`\nUploading prompt ${index + 1}/${prompts.length}: ${prompt.titleEn}`);
      
      try {
        // Create the prompt in the database
        const createdPrompt = await prisma.prompt.create({
          data: {
            titleEn: prompt.titleEn,
            titleAr: prompt.titleAr,
            descriptionEn: prompt.descriptionEn,
            descriptionAr: prompt.descriptionAr,
            promptTextEn: prompt.promptTextEn,
            promptTextAr: prompt.promptTextAr,
            instructionEn: prompt.instructionEn,
            instructionAr: prompt.instructionAr,
            isPro: prompt.isPro,
            initialCopyCount: prompt.initialCopyCount,
            copyCount: prompt.initialCopyCount
          }
        });
        
        console.log(`Created prompt with ID: ${createdPrompt.id}`);
        
        // Add categories
        if (prompt.category.id && prompt.subcategory.id) {
          await prisma.promptCategory.create({
            data: {
              promptId: createdPrompt.id,
              categoryId: prompt.category.id,
              subcategoryId: prompt.subcategory.id
            }
          });
          console.log(`Added category: ${prompt.category.name} and subcategory: ${prompt.subcategory.name}`);
        } else {
          console.warn(`Warning: Skipping category association for prompt ${createdPrompt.id} due to missing category or subcategory ID`);
        }
        
        // Add tools
        for (const tool of prompt.tools) {
          if (tool.id) {
            await prisma.promptTool.create({
              data: {
                promptId: createdPrompt.id,
                toolId: tool.id
              }
            });
            console.log(`Added tool: ${tool.name}`);
          } else {
            console.warn(`Warning: Skipping tool association for tool ${tool.name} due to missing ID`);
          }
        }
        
        // Add keywords
        for (const keyword of prompt.keywords) {
          await prisma.promptKeyword.create({
            data: {
              promptId: createdPrompt.id,
              keyword: keyword
            }
          });
        }
        console.log(`Added ${prompt.keywords.length} keywords`);
        
        console.log(`Successfully uploaded prompt: ${prompt.titleEn}`);
      } catch (promptError) {
        console.error(`Error creating prompt ${prompt.titleEn}:`, promptError);
      }
    }
    
    console.log('\nPrompts upload completed!');
    
    // Count the prompts in the database
    const promptCount = await prisma.prompt.count();
    console.log(`Total prompts in database: ${promptCount}`);
    
  } catch (error) {
    console.error('Error during prompts upload:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the upload
uploadPrompts()
  .catch((error) => {
    console.error('Failed to upload prompts:', error);
    process.exit(1);
  });
