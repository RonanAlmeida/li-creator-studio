import { NextRequest, NextResponse } from 'next/server';
import { generateImageFromPrompt } from '@/lib/services/gemini-image.service';
import type { ImageGenerationRequest, ImageGenerationResponse } from '@/lib/types/image-overlay';
import path from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const body: ImageGenerationRequest = await request.json();
    const { prompt, jobId, imageIndex } = body;

    // Validate inputs
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Invalid prompt provided' } as ImageGenerationResponse,
        { status: 400 }
      );
    }

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid jobId provided' } as ImageGenerationResponse,
        { status: 400 }
      );
    }

    if (typeof imageIndex !== 'number' || imageIndex < 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid imageIndex provided' } as ImageGenerationResponse,
        { status: 400 }
      );
    }

    // Check if image already exists to save credits
    const imageDir = path.join(process.cwd(), 'public', 'generated-videos', 'images', jobId);
    const existingImagePath = path.join(imageDir, `image_${imageIndex}.png`);
    const publicImageUrl = `/generated-videos/images/${jobId}/image_${imageIndex}.png`;

    if (fs.existsSync(existingImagePath)) {
      console.log(`[API] Image already exists, reusing: ${existingImagePath}`);
      return NextResponse.json({
        success: true,
        imagePath: existingImagePath,
        imageUrl: publicImageUrl,
      } as ImageGenerationResponse);
    }

    // Generate image using DALL-E
    const result = await generateImageFromPrompt(prompt, jobId, imageIndex);

    return NextResponse.json({
      success: true,
      imagePath: result.imagePath,
      imageUrl: result.imageUrl,
    } as ImageGenerationResponse);

  } catch (error) {
    console.error('Error in generate-image API:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { success: false, error: errorMessage } as ImageGenerationResponse,
      { status: 500 }
    );
  }
}
