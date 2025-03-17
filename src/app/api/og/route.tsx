import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
 
export const runtime = 'edge'
 
/**
 * API route that generates dynamic OpenGraph images for better social media sharing
 * Used for generating preview images for prompts, categories, and other content
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    
    // Get title from searchParams, with a fallback
    const title = searchParams.get('title') || 'Promptaat - AI Prompt Library'
    
    // Get category from searchParams (optional)
    const category = searchParams.get('category')
    
    // Get locale from searchParams, default to 'en'
    const locale = searchParams.get('locale') || 'en'
    
    // Check if RTL is needed (for Arabic)
    const isRTL = locale === 'ar'
    
    // Generate OpenGraph image with Next.js ImageResponse
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: '#F8FAFC',
            backgroundImage: 'linear-gradient(to bottom right, #2b79ef22, #6d36f122)',
            padding: '40px',
            direction: isRTL ? 'rtl' : 'ltr',
          }}
        >
          {/* Logo container */}
          <div 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              top: '40px',
              left: isRTL ? 'auto' : '40px',
              right: isRTL ? '40px' : 'auto',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#2b79ef" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{ marginLeft: isRTL ? 0 : '10px', marginRight: isRTL ? '10px' : 0, fontSize: '28px', fontWeight: 'bold', color: '#2b79ef' }}>
              {isRTL ? 'برومبتات' : 'Promptaat'}
            </div>
          </div>
          
          {/* Main content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: isRTL ? 'right' : 'left',
              width: '100%',
              maxWidth: '700px',
            }}
          >
            {/* Title with gradient */}
            <div
              style={{
                background: 'linear-gradient(to right, #2b79ef, #6d36f1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '64px',
                fontWeight: 'bold',
                lineHeight: 1.2,
                margin: '20px 0',
                maxWidth: '80%',
              }}
            >
              {title}
            </div>
            
            {/* Category badge if provided */}
            {category && (
              <div
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  fontSize: '24px',
                  fontWeight: 'medium',
                  backgroundColor: '#2b79ef22',
                  color: '#2b79ef',
                  marginTop: '20px',
                }}
              >
                {category}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              fontSize: '24px',
              color: '#64748B',
            }}
          >
            {isRTL ? 'مكتبة بروبتات الذكاء الاصطناعي' : 'AI Prompt Library'}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (e) {
    console.error(`Error generating OG image: ${e}`)
    return new Response(`Failed to generate image`, { status: 500 })
  }
}
