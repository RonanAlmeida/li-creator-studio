import { NextRequest, NextResponse } from 'next/server';
import { overlayAudioAndCaptions } from '@/lib/services/video-overlay.service';
import { generateJobId } from '@/lib/services/pipeline.service';
import { CaptionOptions } from '@/types';
import type { ImageOverlay } from '@/lib/types/image-overlay';
import path from 'path';
import fs from 'fs';

/**
 * POST /api/video/overlay
 * Overlay audio narration and captions on existing sample video
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { text, voiceId, captions, backgroundMusic, imageOverlays } = body;

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

    if (!voiceId || typeof voiceId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Voice ID is required' },
        { status: 400 }
      );
    }

    // Validate caption options
    const captionOptions: CaptionOptions = captions || {
      enabled: true,
      position: 'bottom',
      style: 'bold',
      size: 18,
      color: '#FFFFFF',
      fontFamily: 'Reddit Sans',
    };

    // Generate unique job ID
    const jobId = generateJobId();
    console.log(`[API] Starting video overlay: ${jobId}`);

    // Path to sample video
    const sampleVideoPath = path.join(
      process.cwd(),
      'public',
      'generated-videos',
      'videos',
      'sample_falai_output.mp4'
    );

    // Path to background music (if selected)
    let backgroundMusicPath: string | undefined;
    if (backgroundMusic) {
      backgroundMusicPath = path.join(
        process.cwd(),
        'public',
        'background-music',
        backgroundMusic
      );
    }

    // Validate image overlays if provided
    let validatedImageOverlays: ImageOverlay[] | undefined;
    if (imageOverlays && Array.isArray(imageOverlays)) {
      validatedImageOverlays = [];
      for (const overlay of imageOverlays) {
        if (!overlay.imagePath || !fs.existsSync(overlay.imagePath)) {
          console.warn(`[API] Image not found, skipping: ${overlay.imagePath}`);
          continue;
        }
        validatedImageOverlays.push({
          imagePath: overlay.imagePath,
          timestamp: overlay.timestamp || 0,
          duration: overlay.duration || 2,
          x: overlay.x,
          y: overlay.y,
        });
      }
      console.log(`[API] Validated ${validatedImageOverlays.length} image overlays`);
    }

    // Overlay audio and captions on sample video
    const result = await overlayAudioAndCaptions(
      sampleVideoPath,
      text,
      voiceId,
      captionOptions,
      jobId,
      backgroundMusicPath,
      validatedImageOverlays
    );

    console.log(`[API] Video overlay complete: ${jobId}`);

    // Construct response
    const video = {
      id: jobId,
      url: `/generated-videos/final/${jobId}.mp4`,
      thumbnail: `/generated-videos/videos/sample_falai_output.mp4`,
      duration: result.duration,
      resolution: '606x1080', // Sample video actual resolution
      transcript: text,
      captionsIncluded: true,
      captionOptions: captionOptions,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        video,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Video overlay failed:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // Check for specific errors
    if (errorMessage.includes('API key')) {
      return NextResponse.json(
        {
          success: false,
          error: 'API configuration error. Please check your environment variables.',
        },
        { status: 500 }
      );
    }

    if (errorMessage.includes('ENOENT') || errorMessage.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Required system dependencies or sample video not found.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `Failed to overlay audio and captions: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
