import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import path from 'path';

const prisma = new PrismaClient();

interface CategoryData {
  name: {
    en: string;
    ar: string;
  };
  icon: string;
  subcategories: Array<{
    en: string;
    ar: string;
  }>;
}

async function seedCategories() {
  try {
    console.log('Starting categories seeding...');

    // Parse the categories from the markdown file
    const categoriesFile = path.join(process.cwd(), 'docs', 'categories_data_entry.md');
    const fileContent = fs.readFileSync(categoriesFile, 'utf8');
    
    // Extract category blocks
    const categoryBlocks = fileContent.split('###').slice(1); // Skip the header

    for (const block of categoryBlocks) {
      const lines = block.trim().split('\n');
      const categoryName = lines[0].trim();
      
      // Extract icon
      const iconLine = lines.find(line => line.includes('Icon:'));
      const icon = iconLine?.split('`')[1] || '';

      // Extract names
      const nameEnLine = lines.find(line => line.includes('Name (EN):'));
      const nameEn = nameEnLine?.split(':')[1].trim() || '';

      const nameArLine = lines.find(line => line.includes('Name (AR):'));
      const nameAr = nameArLine?.split(':')[1].trim() || '';

      // Create main category
      const category = await prisma.category.create({
        data: {
          nameEn,
          nameAr,
          iconName: icon
        }
      });

      console.log(`Created category: ${category.nameEn}`);

      // Extract and create subcategories
      const subcategoriesStart = lines.findIndex(line => line.includes('Subcategories:'));
      if (subcategoriesStart !== -1) {
        const subcategoryLines = lines.slice(subcategoriesStart + 1)
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.trim().slice(2));

        for (const subLine of subcategoryLines) {
          const [subEn, subAr] = subLine.split('(').map(s => s.trim());
          const nameAr = subAr ? subAr.slice(0, -1) : ''; // Remove closing parenthesis

          const subcategory = await prisma.category.create({
            data: {
              nameEn: subEn.trim(),
              nameAr: nameAr.trim(),
              iconName: icon,
              parentId: category.id
            }
          });

          console.log(`Created subcategory: ${subcategory.nameEn}`);
        }
      }
    }

    console.log('Categories seeding completed successfully');
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  }
}

export { seedCategories };
