import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateFavicon() {
  try {
    // Read the SVG file
    const svgPath = path.join(__dirname, '../public/Favicon.svg');
    
    // Create favicon.ico (32x32)
    await sharp(svgPath)
      .resize(32, 32)
      .toFile(path.join(__dirname, '../public/favicon.ico'));
    
    console.log('✅ favicon.ico generated successfully');
  } catch (error) {
    console.error('Error generating favicon:', error);
  }
}

generateFavicon();
