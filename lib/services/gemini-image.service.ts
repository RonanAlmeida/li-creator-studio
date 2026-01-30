import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import axios from 'axios';

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

    // Call Gemini 2.5 Flash Image Preview API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Simple, clean, minimalist icon: ${prompt}. Icon style, no text, plain background.`,
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Extract base64 image from response
    // Gemini returns the image in candidates[0].content.parts[0].inlineData.data
    const imageB64 = response.data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!imageB64) {
      throw new Error('No image data returned from Gemini');
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
    console.error('Error generating image from Imagen:', error);

    // If Imagen fails, provide helpful error message
    if (axios.isAxiosError(error)) {
      console.error('Imagen API error:', error.response?.data);
      throw new Error(`Imagen API error: ${error.response?.data?.error?.message || error.message}`);
    }

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
