import { NextRequest, NextResponse } from 'next/server';
import { executeVideoPipeline, generateJobId } from '@/lib/services/pipeline.service';
import { CaptionOptions } from '@/types';

/**
 * POST /api/video/text-to-video
 * Generate video from text script
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { text, captions } = body;

    // Validate input
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

    // Validate caption options if provided
    let captionOptions: CaptionOptions | undefined;
    if (captions) {
      captionOptions = captions as CaptionOptions;
    }

    // Generate unique job ID
    const jobId = generateJobId();
    console.log(`[API] Starting text-to-video generation: ${jobId}`);

    // Execute pipeline (no image for text-to-video)
    const video = await executeVideoPipeline(text, undefined, captionOptions, jobId);

    console.log(`[API] Text-to-video generation complete: ${jobId}`);

    return NextResponse.json(
      {
        success: true,
        video,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Text-to-video generation failed:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // Check for specific errors
    if (errorMessage.includes('API key')) {
      return NextResponse.json(
        {
          success: false,
          error: 'API Keys Not Configured\n\nPlease click the Settings icon (⚙️) in the top right corner to configure your API keys.\n\nRequired API keys:\n- OpenAI API Key (AI script generation & transcription)\n- ElevenLabs API Key (AI voice narration)\n- Gemini API Key (Image generation)\n- Fal.ai API Key (Video generation)\n\nAlternatively, you can add these keys to your .env file for development.'
        },
        { status: 500 }
      );
    }

    if (errorMessage.includes('ENOENT') || errorMessage.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Required system dependencies not found. Please ensure ffmpeg is installed.' },
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
