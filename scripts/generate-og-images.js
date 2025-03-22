const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create directory if it doesn't exist
const ogDir = path.join(__dirname, '../public/og');
if (!fs.existsSync(ogDir)) {
  fs.mkdirSync(ogDir, { recursive: true });
}

// Create benchmark OG images
async function generateBenchmarkOG() {
  // Create canvas with 1200x630 dimensions (standard OG image size)
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');
  
  // English version
  await createOGImage(
    ctx, 
    canvas, 
    'AI Prompt Performance Benchmarks | Promptaat',
    'Explore comprehensive AI prompt performance data: 92% accuracy, 87% quality score, 63% time efficiency',
    'en',
    path.join(ogDir, 'benchmark-og-en.jpg')
  );
  
  // Arabic version
  await createOGImage(
    ctx, 
    canvas, 
    'المقاييس المعيارية | برومتات',
    'اكتشف كيف تتفوق برومتات في المقاييس المعيارية للدقة والجودة والكفاءة الزمنية ورضا المستخدم والإبداع',
    'ar',
    path.join(ogDir, 'benchmark-og-ar.jpg')
  );
  
  console.log('OpenGraph images for benchmark page created successfully!');
}

async function createOGImage(ctx, canvas, title, description, lang, outputPath) {
  // Fill background with dark color (matches Promptaat's dark theme)
  ctx.fillStyle = '#212938'; // Dark background
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add gradient accent
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, 'rgba(46, 172, 68, 0.15)'); // Green accent
  gradient.addColorStop(1, 'rgba(109, 54, 241, 0.15)'); // Purple accent
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add Promptaat logo
  try {
    const logo = await loadImage(path.join(__dirname, '../public/Promptaat_logo_white.svg'));
    const logoSize = 120;
    const logoX = 80;
    const logoY = 80;
    ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
  } catch (error) {
    console.error('Could not load logo, using text fallback:', error.message);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText('PROMPTAAT', 80, 120);
  }
  
  // Set text direction for Arabic
  if (lang === 'ar') {
    ctx.direction = 'rtl';
    ctx.textAlign = 'right';
  } else {
    ctx.direction = 'ltr';
    ctx.textAlign = 'left';
  }
  
  // Add title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 60px sans-serif';
  const titleX = lang === 'ar' ? canvas.width - 80 : 80;
  ctx.fillText(title, titleX, 280);
  
  // Add description
  ctx.fillStyle = '#9ca2ae'; // Light grey
  ctx.font = '30px sans-serif';
  
  // Add description text with wrapping
  const words = description.split(' ');
  let line = '';
  let y = 350;
  const maxWidth = canvas.width - 160; // 80px padding on both sides
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, titleX, y);
      line = words[i] + ' ';
      y += 50;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, titleX, y);
  
  // Add stats visualization (simple chart representation)
  const chartStartX = 80;
  const chartStartY = 450;
  const chartWidth = canvas.width - 160;
  const chartHeight = 100;
  
  // Draw chart bars
  const metrics = [
    { label: lang === 'ar' ? 'الدقة' : 'Accuracy', value: 0.92, color: '#6d36f1' },
    { label: lang === 'ar' ? 'الجودة' : 'Quality', value: 0.87, color: '#2eac44' },
    { label: lang === 'ar' ? 'الوقت' : 'Time', value: 0.63, color: '#2b79ef' }
  ];
  
  const barWidth = chartWidth / metrics.length - 40;
  
  metrics.forEach((metric, index) => {
    const barX = chartStartX + (index * (barWidth + 40));
    const barHeight = chartHeight * metric.value;
    const barY = chartStartY + (chartHeight - barHeight);
    
    // Draw bar
    ctx.fillStyle = metric.color;
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Draw label
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(metric.label, barX + barWidth / 2, chartStartY + chartHeight + 30);
    
    // Draw value
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(Math.round(metric.value * 100) + '%', barX + barWidth / 2, barY - 10);
  });
  
  // Reset text alignment
  ctx.textAlign = 'left';
  
  // Save image
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
  fs.writeFileSync(outputPath, buffer);
  console.log(`Created: ${outputPath}`);
}

// Run the generator
generateBenchmarkOG().catch(console.error);
