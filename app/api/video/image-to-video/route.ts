import { NextRequest, NextResponse } from 'next/server';
import { executeVideoPipeline, generateJobId } from '@/lib/services/pipeline.service';
import { CaptionOptions } from '@/types';
import fs from 'fs';
import path from 'path';

/**
 * POST /api/video/image-to-video
 * Generate video from text script and image
 */
export async function POST(request: NextRequest) {
  let imagePath: string | undefined;

  try {
    // Parse multipart form data
    const formData = await request.formData();
    const text = formData.get('text') as string;
    const imageFile = formData.get('image') as File;
    const captionsJson = formData.get('captions') as string;

    // Validate text
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Text script is required' },
        { status: 400 }
      );
    }

    if (text.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Text must be at least 10 characters long' },
        { status: 400 }
      );
    }

    if (text.length > 3000) {
      return NextResponse.json(
        { success: false, error: 'Text must be less than 3000 characters' },
        { status: 400 }
      );
    }

    // Validate image
    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: 'Image file is required' },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Image file must be less than 10MB' },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid image type. Allowed types: JPG, PNG, GIF, WebP',
        },
        { status: 400 }
      );
    }

    // Parse caption options if provided
    let captionOptions: CaptionOptions | undefined;
    if (captionsJson) {
      try {
        captionOptions = JSON.parse(captionsJson) as CaptionOptions;
      } catch (error) {
        return NextResponse.json(
          { success: false, error: 'Invalid caption options JSON' },
          { status: 400 }
        );
      }
    }

    // Generate unique job ID
    const jobId = generateJobId();
    console.log(`[API] Starting image-to-video generation: ${jobId}`);

    // Save uploaded image
    const uploadDir = path.join(process.cwd(), 'public', 'generated-videos', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(imageFile.name) || '.jpg';
    imagePath = path.join(uploadDir, `${jobId}${ext}`);

    // Convert File to Buffer and write to disk
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    fs.writeFileSync(imagePath, buffer);

    console.log(`[API] Image saved to ${imagePath}`);

    // Execute pipeline with image
    const video = await executeVideoPipeline(text, imagePath, captionOptions, jobId);

    console.log(`[API] Image-to-video generation complete: ${jobId}`);

    return NextResponse.json(
      {
        success: true,
        video,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Image-to-video generation failed:', error);

    // Clean up uploaded image if it exists
    if (imagePath && fs.existsSync(imagePath)) {
      try {
        fs.unlinkSync(imagePath);
        console.log(`[API] Cleaned up uploaded image: ${imagePath}`);
      } catch (cleanupError) {
        console.error('[API] Failed to clean up image:', cleanupError);
      }
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // Check for specific errors
    if (errorMessage.includes('API key')) {
      return NextResponse.json(
        {
          success: false,
          error: 'API Keys Not Configured\n\nPlease add the following API keys to your .env file:\n\n- OPEN_AI_API_KEY (AI script generation & transcription)\n- ELEVENLABS_API_KEY (AI voice narration)\n- GEMINI_API_KEY (Image generation with Gemini)\n- FAL_KEY (Video generation with Fal.ai)\n\nGet your keys:\n- OpenAI: https://platform.openai.com/api-keys\n- ElevenLabs: https://elevenlabs.io/app/settings/api-keys\n- Gemini: https://makersuite.google.com/app/apikey\n- Fal.ai: https://fal.ai/dashboard/keys',
        },
        { status: 500 }
      );
    }

    if (errorMessage.includes('ENOENT') || errorMessage.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Required system dependencies not found. Please ensure ffmpeg is installed.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `Failed to generate video: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
