import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import OpenAI from 'openai';

// Lazy initialize OpenAI client to avoid build-time errors
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPEN_AI_API_KEY) {
      throw new Error('OPEN_AI_API_KEY is not configured in environment variables');
    }
    openai = new OpenAI({
      apiKey: process.env.OPEN_AI_API_KEY,
    });
  }
  return openai;
}

export async function generateImageFromPrompt(
  prompt: string,
  jobId: string,
  imageIndex: number
): Promise<{ imagePath: string; imageUrl: string }> {

  // Create directory for images if it doesn't exist
  const imageDir = path.join(
    process.cwd(),
    'public',
    'generated-videos',
    'images',
    jobId
  );

  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }

  try {
    console.log('[Image Gen] Calling DALL-E 3 with prompt:', prompt);

    // Call DALL-E 3 API with base64 response to avoid download issues
    const client = getOpenAIClient();
    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt: `Simple, clean, minimalist icon: ${prompt}. Icon style, no text, plain background.`,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'b64_json', // Get base64 directly instead of URL
    });

    const imageB64 = response.data?.[0]?.b64_json;
    if (!imageB64) {
      throw new Error('No image data returned from DALL-E');
    }

    console.log('[Image Gen] Image generated successfully, decoding base64...');

    // Decode base64 to buffer
    const imageBuffer = Buffer.from(imageB64, 'base64');

    // Save original high-res image temporarily
    const tempImagePath = path.join(imageDir, `temp_${imageIndex}.png`);
    fs.writeFileSync(tempImagePath, imageBuffer);

    // Resize to 500px width to fill most of the screen
    const finalImagePath = path.join(imageDir, `image_${imageIndex}.png`);
    await sharp(tempImagePath)
      .resize(500, null, {
        fit: 'contain',
        withoutEnlargement: false,
      })
      .png()
      .toFile(finalImagePath);

    // Delete temp file
    fs.unlinkSync(tempImagePath);

    // Generate public URL
    const publicImageUrl = `/generated-videos/images/${jobId}/image_${imageIndex}.png`;

    console.log('[Image Gen] Success! Image saved to:', finalImagePath);
    return {
      imagePath: finalImagePath,
      imageUrl: publicImageUrl,
    };
  } catch (error) {
    console.error('Error generating image from DALL-E:', error);
    throw error;
  }
}

async function createPlaceholderImage(color: string, prompt: string): Promise<Buffer> {
  // Create a 1024x1024 colored square with text
  const size = 1024;
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${color}"/>
      <text
        x="50%"
        y="50%"
        font-family="Arial, sans-serif"
        font-size="48"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
        dominant-baseline="middle"
      >${prompt.slice(0, 20)}${prompt.length > 20 ? '...' : ''}</text>
    </svg>
  `;

  // Convert SVG to PNG buffer using sharp
  return sharp(Buffer.from(svg)).png().toBuffer();
}

export async function cleanupJobImages(jobId: string): Promise<void> {
  const imageDir = path.join(
    process.cwd(),
    'public',
    'generated-videos',
    'images',
    jobId
  );

  if (fs.existsSync(imageDir)) {
    fs.rmSync(imageDir, { recursive: true });
  }
}
