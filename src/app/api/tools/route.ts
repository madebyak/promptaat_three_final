import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    // Get locale for response metadata
    const locale = searchParams.get("locale") || "en"
    
    // Fetch all published tools
    const dbTools = await prisma.tool.findMany({
      where: {
        deletedAt: null, // Only fetch non-deleted tools
      },
      orderBy: { 
        name: "asc" 
      }
    })
    
    // Format the response from database tools
    let formattedTools = dbTools.map(tool => ({
      id: tool.id,
      name: tool.name,
      iconUrl: tool.iconUrl,
    }))
    
    // If no tools found in database, provide mock data
    if (formattedTools.length === 0) {
      console.log('No tools found in database, providing mock data')
      formattedTools = [
        {
          id: 'chatgpt',
          name: 'ChatGPT',
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/2111/2111425.png'
        },
        {
          id: 'midjourney',
          name: 'Midjourney',
          iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Midjourney_Emblem.png'
        },
        {
          id: 'stable-diffusion',
          name: 'Stable Diffusion',
          iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Stability_AI_logo.svg'
        },
        {
          id: 'dall-e',
          name: 'DALL-E',
          iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/DALL-E_Logo.svg/1200px-DALL-E_Logo.svg.png'
        },
        {
          id: 'claude',
          name: 'Claude',
          iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Claude_logo.svg/1200px-Claude_logo.svg.png'
        }
      ]
    }
    
    return NextResponse.json({ 
      tools: formattedTools,
      metadata: { locale } // Include locale in response metadata
    })
  } catch (error) {
    console.error("Get public tools error:", error)
    return NextResponse.json(
      { error: "Failed to fetch tools" },
      { status: 500 }
    )
  }
}
