import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import path from 'path';

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

async function seedPrompts() {
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

      // 1. Look up category and subcategory IDs
      const category = await prisma.category.findFirst({
        where: {
          nameEn: promptData.categories.category,
          deletedAt: null
        }
      });

      if (!category) {
        console.warn(`Category not found: ${promptData.categories.category}`);
        continue;
      }

      const subcategory = await prisma.category.findFirst({
        where: {
          parentId: category.id,
          nameEn: promptData.categories.subcategory,
          deletedAt: null
        }
      });

      if (!subcategory) {
        console.warn(`Subcategory not found: ${promptData.categories.subcategory}`);
        continue;
      }

      // 2. Look up tool IDs
      const tools = await Promise.all(
        promptData.tools.map(async (toolName) => {
          const tool = await prisma.tool.findFirst({
            where: {
              name: toolName,
              deletedAt: null
            }
          });
          if (!tool) {
            console.warn(`Tool not found: ${toolName}`);
          }
          return tool;
        })
      );

      const validTools = tools.filter((tool): tool is NonNullable<typeof tool> => tool !== null);

      // 3. Create the prompt with its relations
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
            create: validTools.map(tool => ({
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

      console.log(`Created prompt: ${prompt.titleEn}`);
    }

    console.log('Prompts seeding completed successfully');
  } catch (error) {
    console.error('Error seeding prompts:', error);
    throw error;
  }
}

export { seedPrompts };
