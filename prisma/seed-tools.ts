import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const tools = [
  {
    name: 'ChatGPT',
    icon_url: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    website_url: 'https://chat.openai.com'
  },
  {
    name: 'Claude',
    icon_url: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Claude_%28AI%29_logo.svg',
    website_url: 'https://claude.ai'
  },
  {
    name: 'Gemini',
    icon_url: 'https://storage.googleapis.com/gweb-uniblog-publish-prod/images/gemini.max-1000x1000.png',
    website_url: 'https://gemini.google.com'
  },
  {
    name: 'Notion AI',
    icon_url: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png',
    website_url: 'https://notion.so'
  },
  {
    name: 'Bing AI',
    icon_url: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Bing_Fluent_Logo.svg',
    website_url: 'https://bing.com/chat'
  },
  {
    name: 'Deepseek',
    icon_url: 'https://www.deepseek.com/_next/static/media/logo.0ccb9c97.svg',
    website_url: 'https://chat.deepseek.com'
  }
]

async function main() {
  console.log('Start seeding tools...')
  
  for (const tool of tools) {
    const createdTool = await prisma.tool.create({
      data: tool
    })
    console.log(`Created tool: ${createdTool.name}`)
  }
  
  console.log('Tools seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
