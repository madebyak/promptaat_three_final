import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Get all top-level categories
    const categories = await prisma.category.findMany({
      where: {
        parentId: null,
        deletedAt: null
      }
    });

    console.log(`Found ${categories.length} top-level categories`);

    // Create subcategories for Business category
    const businessCategory = categories.find(c => c.nameEn === 'Business');
    if (businessCategory) {
      console.log(`Creating subcategories for Business category (${businessCategory.id})`);
      
      const businessSubcategories = [
        { nameEn: 'Marketing', nameAr: 'تسويق', iconName: 'megaphone' },
        { nameEn: 'Sales', nameAr: 'مبيعات', iconName: 'badge-dollar-sign' },
        { nameEn: 'Management', nameAr: 'إدارة', iconName: 'users' }
      ];

      for (const [index, subcategory] of businessSubcategories.entries()) {
        await prisma.category.create({
          data: {
            nameEn: subcategory.nameEn,
            nameAr: subcategory.nameAr,
            iconName: subcategory.iconName,
            parentId: businessCategory.id,
            sortOrder: index
          }
        });
        console.log(`Created subcategory: ${subcategory.nameEn}`);
      }
    }

    // Create subcategories for Finance category
    const financeCategory = categories.find(c => c.nameEn === 'Finance');
    if (financeCategory) {
      console.log(`Creating subcategories for Finance category (${financeCategory.id})`);
      
      const financeSubcategories = [
        { nameEn: 'Investing', nameAr: 'استثمار', iconName: 'trending-up' },
        { nameEn: 'Personal Finance', nameAr: 'تمويل شخصي', iconName: 'wallet' },
        { nameEn: 'Taxes', nameAr: 'ضرائب', iconName: 'receipt' }
      ];

      for (const [index, subcategory] of financeSubcategories.entries()) {
        await prisma.category.create({
          data: {
            nameEn: subcategory.nameEn,
            nameAr: subcategory.nameAr,
            iconName: subcategory.iconName,
            parentId: financeCategory.id,
            sortOrder: index
          }
        });
        console.log(`Created subcategory: ${subcategory.nameEn}`);
      }
    }

    // Create subcategories for AI category
    const aiCategory = categories.find(c => c.nameEn === 'Artificial Intelligence (AI)');
    if (aiCategory) {
      console.log(`Creating subcategories for AI category (${aiCategory.id})`);
      
      const aiSubcategories = [
        { nameEn: 'ChatGPT', nameAr: 'تشات جي بي تي', iconName: 'message-square' },
        { nameEn: 'Midjourney', nameAr: 'ميدجورني', iconName: 'image' },
        { nameEn: 'DALL-E', nameAr: 'دالي', iconName: 'image-plus' },
        { nameEn: 'Claude', nameAr: 'كلود', iconName: 'bot' }
      ];

      for (const [index, subcategory] of aiSubcategories.entries()) {
        await prisma.category.create({
          data: {
            nameEn: subcategory.nameEn,
            nameAr: subcategory.nameAr,
            iconName: subcategory.iconName,
            parentId: aiCategory.id,
            sortOrder: index
          }
        });
        console.log(`Created subcategory: ${subcategory.nameEn}`);
      }
    }

    console.log('Test subcategories created successfully!');
  } catch (error) {
    console.error('Error creating test subcategories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
