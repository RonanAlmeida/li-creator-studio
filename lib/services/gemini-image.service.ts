import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { GoogleGenAI } from '@google/genai';

export async function generateImageFromPrompt(
  prompt: string,
  jobId: string,
  imageIndex: number
): Promise<{ imagePath: string; imageUrl: string }> {

  // Check for API key
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }

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
    console.log('[Image Gen] Calling Gemini 2.5 Flash Image with prompt:', prompt);

    // Initialize Google GenAI SDK
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Generate image using Gemini 2.5 Flash Image
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: `${prompt}. Cute cartoon illustration style, simple flat design, not too detailed, friendly and approachable, small icon-like size.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // Required to get image output
      } as any, // Type assertion to bypass SDK type limitations
    });

    // Extract base64 image from response
    // IMPORTANT: Loop through ALL parts - image might not be in parts[0]
    let imageB64: string | undefined;

    try {
      const parts = response?.candidates?.[0]?.content?.parts || [];
      console.log('[Image Gen] Response has', parts.length, 'parts');

      // Find the part with image data
      for (const part of parts) {
        if (part.inlineData?.data) {
          imageB64 = part.inlineData.data;
          console.log('[Image Gen] ✓ Found image in parts, length:', imageB64.length);
          break;
        } else if (part.text) {
          console.log('[Image Gen] Found text part:', part.text.substring(0, 100));
        }
      }
    } catch (err) {
      console.error('[Image Gen] Error during extraction:', err);
    }

    if (!imageB64) {
      console.error('[Image Gen] Failed to extract image from response.');
      console.error('[Image Gen] This usually means Gemini returned text-only or the prompt was unclear.');
      throw new Error('No image data returned from Gemini - prompt may need to be more specific');
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
    console.error('Error generating image from Gemini:', error);

    // Provide helpful error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Gemini image generation failed: ${errorMessage}`);
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
