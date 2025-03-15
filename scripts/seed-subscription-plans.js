// Script to seed subscription plans and prices in the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Seeding subscription plans and prices...');
    
    // Check if plans already exist
    const existingPlans = await prisma.subscriptionPlan.findMany();
    console.log(`Found ${existingPlans.length} existing subscription plans`);
    
    if (existingPlans.length === 0) {
      // Create Pro plan
      const proPlan = await prisma.subscriptionPlan.create({
        data: {
          name: JSON.stringify({ en: "Pro Plan", ar: "الخطة الاحترافية" }),
          description: JSON.stringify({ 
            en: "Access to all premium prompts and features", 
            ar: "الوصول إلى جميع الإرشادات والميزات المتميزة" 
          }),
          features: JSON.stringify([
            { en: "Access to all premium prompts", ar: "الوصول إلى جميع الإرشادات المتميزة" },
            { en: "Priority support", ar: "دعم ذو أولوية" },
            { en: "New prompts added regularly", ar: "إضافة إرشادات جديدة بانتظام" }
          ]),
          prices: {
            create: [
              {
                amount: 999, // $9.99
                currency: "USD",
                interval: "monthly",
                intervalCount: 1
              },
              {
                amount: 2499, // $24.99
                currency: "USD",
                interval: "quarterly",
                intervalCount: 3
              },
              {
                amount: 7999, // $79.99
                currency: "USD",
                interval: "annual",
                intervalCount: 12
              }
            ]
          }
        }
      });
      
      console.log('Created Pro plan with ID:', proPlan.id);
    } else {
      console.log('Subscription plans already exist, skipping creation');
    }
    
    // Display all plans and prices
    const plans = await prisma.subscriptionPlan.findMany({
      include: {
        prices: true
      }
    });
    
    console.log('All subscription plans:');
    console.log(JSON.stringify(plans, null, 2));
    
  } catch (error) {
    console.error('Error seeding subscription plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
