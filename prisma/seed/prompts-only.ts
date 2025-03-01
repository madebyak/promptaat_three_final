const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const prisma = new PrismaClient();

interface PromptData {
  // English Content
  titleEn: string;
  descriptionEn?: string;
  promptTextEn: string;
  instructionEn?: string;

  // Arabic Content
  titleAr: string;
  descriptionAr?: string;
  promptTextAr: string;
  instructionAr?: string;

  // Metadata
  isPro: boolean;
  initialCopyCount: number;
  copyCount: number;
  version: number;

  // Relations
  categories: {
    category: string;
    subcategory: string;
  };
  tools: string[];
  keywords: string[];
}

async function seedPromptsOnly() {
  try {
    console.log('Starting prompts seeding...');

    // Read the YAML file
    const promptsFile = path.join(process.cwd(), 'docs', 'prompts_data_entry.md');
    const fileContent = fs.readFileSync(promptsFile, 'utf8');
    
    // Extract YAML blocks from markdown
    const yamlBlocks = fileContent.match(/```yaml([\s\S]*?)```/g);
    if (!yamlBlocks) {
      throw new Error('No YAML blocks found in the prompts data file');
    }

    // Process each prompt
    for (const block of yamlBlocks) {
      const yamlContent = block.replace(/```yaml|```/g, '');
      const promptData = yaml.load(yamlContent) as PromptData;

      try {
        // 1. Look up category ID
        const category = await prisma.category.findFirstOrThrow({
          where: {
            nameEn: promptData.categories.category,
            parentId: null, // Main categories have no parent
            deletedAt: null
          }
        });

        // 2. Look up subcategory ID
        const subcategory = await prisma.category.findFirstOrThrow({
          where: {
            nameEn: promptData.categories.subcategory,
            parentId: category.id, // Subcategories have the main category as parent
            deletedAt: null
          }
        });

        // 3. Look up tool IDs
        const tools = await Promise.all(
          promptData.tools.map(async (toolName) => {
            const tool = await prisma.tool.findFirstOrThrow({
              where: {
                name: toolName,
                deletedAt: null
              }
            });
            return tool;
          })
        );

        // 4. Create the prompt with its relations
        const prompt = await prisma.prompt.create({
          data: {
            titleEn: promptData.titleEn,
            titleAr: promptData.titleAr,
            descriptionEn: promptData.descriptionEn,
            descriptionAr: promptData.descriptionAr,
            promptTextEn: promptData.promptTextEn,
            promptTextAr: promptData.promptTextAr,
            instructionEn: promptData.instructionEn,
            instructionAr: promptData.instructionAr,
            isPro: promptData.isPro,
            copyCount: promptData.copyCount,
            initialCopyCount: promptData.initialCopyCount,
            version: promptData.version,
            // Create category relations
            categories: {
              create: {
                category: {
                  connect: {
                    id: category.id
                  }
                },
                subcategory: {
                  connect: {
                    id: subcategory.id
                  }
                }
              }
            },
            // Create tool relations
            tools: {
              create: tools.map(tool => ({
                tool: {
                  connect: {
                    id: tool.id
                  }
                }
              }))
            },
            // Create keyword relations
            keywords: {
              create: promptData.keywords.map(keyword => ({
                keyword: keyword
              }))
            }
          }
        });

        console.log(`Created prompt: ${prompt.titleEn} (Category: ${category.nameEn}, Subcategory: ${subcategory.nameEn})`);
      } catch (error) {
        console.error(`Error processing prompt "${promptData.titleEn}":`, error);
        // Continue with next prompt
        continue;
      }
    }

    console.log('Prompts seeding completed successfully');
  } catch (error) {
    console.error('Error seeding prompts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this script is executed directly
if (require.main === module) {
  seedPromptsOnly()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

module.exports = { seedPromptsOnly };
