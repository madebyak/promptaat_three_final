import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

// Export dynamic settings for OpenGraph images
export const runtime = 'edge';
export const revalidate = 0; // No cache
export const dynamic = 'force-dynamic';
export const size = { width: 1200, height: 630 };

// Route segment config
export const contentType = 'image/jpeg';

export default async function Image({ params }: { params: { locale: string } }) {
  try {
    // Determine which image to load based on locale
    const imagePath = params.locale === 'ar' 
      ? new URL('/public/og/home-og-ar.jpg', import.meta.url)
      : new URL('/public/og/home-og-en.jpg', import.meta.url);
      
    // Load the pre-generated image
    const image = await fetch(imagePath).then(res => res.arrayBuffer());
      
    // Return the response as an ImageResponse for optimal handling
    return new ImageResponse(
      (
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
          <img 
            src={`data:image/jpeg;base64,${Buffer.from(image).toString('base64')}`} 
            alt="Promptaat"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    // Fallback text response if image fails to load
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
            backgroundColor: '#000',
            color: '#fff',
            fontSize: 48,
            fontWeight: 'bold',
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <div>Promptaat</div>
          <div style={{ fontSize: 32, marginTop: '1rem' }}>The Largest AI Prompt Library</div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
