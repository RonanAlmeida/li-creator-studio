import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { overlayAudioAndCaptions } from '@/lib/services/video-overlay.service';
import { generateId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const caption = formData.get('caption') as string;
    const script = formData.get('script') as string;
    const voiceId = formData.get('voiceId') as string;
    const musicId = formData.get('musicId') as string;
    const captionOptionsStr = formData.get('captionOptions') as string;
    const images = formData.getAll('images') as File[];

    console.log('[Ad Gen API] Starting ad generation');
    console.log('[Ad Gen API] Caption:', caption);
    console.log('[Ad Gen API] Script:', script);
    console.log('[Ad Gen API] Voice:', voiceId);
    console.log('[Ad Gen API] Music:', musicId);
    console.log('[Ad Gen API] Images:', images.length);

    // Parse caption options
    let captionOptions;
    try {
      captionOptions = JSON.parse(captionOptionsStr);
      console.log('[Ad Gen API] Caption options:', captionOptions);
    } catch (err) {
      console.error('[Ad Gen API] Failed to parse caption options:', err);
      captionOptions = {
        enabled: true,
        style: 'default',
        fontFamily: 'Reddit Sans',
        position: 'bottom',
        color: '#59C734',
        size: 24,
      };
    }

    // Validate inputs
    if (!caption || !script) {
      return NextResponse.json(
        { error: 'Caption and script are required' },
        { status: 400 }
      );
    }

    if (images.length === 0) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      );
    }

    // Generate unique job ID
    const jobId = `ad_${generateId()}`;

    // Create directory for ad images
    const imageDir = path.join(
      process.cwd(),
      'public',
      'generated-videos',
      'images',
      jobId
    );
    fs.mkdirSync(imageDir, { recursive: true });

    // Save uploaded images
    const imagePaths: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const imagePath = path.join(imageDir, `image_${i}.png`);
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(imagePath, buffer);
      imagePaths.push(imagePath);
      console.log(`[Ad Gen API] Saved image ${i + 1} to ${imagePath}`);
    }

    // Fal AI output campaign video path
    const baseVideoPath = path.join(
      process.cwd(),
      'public',
      'generated-videos',
      'videos',
      'fal_ai_output_camp.mp4'
    );

    // Check if campaign video exists, if not copy from the example path
    if (!fs.existsSync(baseVideoPath)) {
      const exampleVideoPath = '/Users/roalmeid/Downloads/_users_1a6dd450-32f1-4400-966a-e835ac05025d_generated_5a57f930-5589-4848-b1dc-36a24889b00a_generated_video.MP4';
      if (fs.existsSync(exampleVideoPath)) {
        fs.copyFileSync(exampleVideoPath, baseVideoPath);
        console.log('[Ad Gen API] Copied example video to fal_ai_output_camp.mp4');
      } else {
        return NextResponse.json(
          { error: 'Campaign video not found. Please ensure the example video exists.' },
          { status: 500 }
        );
      }
    }

    // Create image overlays at evenly spaced intervals
    // Calculate timing based on script length (assume ~2.5 words per second)
    const wordCount = script.split(' ').filter(w => w).length;
    const estimatedDuration = Math.max(15, wordCount / 2.5); // At least 15 seconds
    const intervalTime = estimatedDuration / (images.length + 1);

    const imageOverlays = imagePaths.map((imagePath, i) => ({
      imagePath,
      timestamp: (i + 1) * intervalTime,
      duration: 2, // Show each image for 2 seconds
    }));

    console.log('[Ad Gen API] Image overlays:', imageOverlays);

    // Get background music path if selected
    let backgroundMusicPath: string | undefined;
    if (musicId && musicId !== 'none') {
      backgroundMusicPath = path.join(
        process.cwd(),
        'public',
        'background-music',
        `${musicId}.mp3`
      );
      if (!fs.existsSync(backgroundMusicPath)) {
        console.warn('[Ad Gen API] Background music file not found:', backgroundMusicPath);
        backgroundMusicPath = undefined;
      }
    }

    // Generate video with overlays
    console.log('[Ad Gen API] Calling video overlay service');
    const result = await overlayAudioAndCaptions(
      baseVideoPath,
      script,
      voiceId,
      captionOptions,
      jobId,
      backgroundMusicPath,
      imageOverlays
    );

    console.log('[Ad Gen API] Ad video generated successfully');

    // Convert absolute path to public URL
    const videoUrl = result.videoPath.replace(
      path.join(process.cwd(), 'public'),
      ''
    ).replace(/\\/g, '/');

    console.log('[Ad Gen API] Video URL:', videoUrl);

    // Return video result
    return NextResponse.json({
      success: true,
      video: {
        id: jobId,
        url: videoUrl,
        thumbnail: '/sample-thumbnail.jpg',
        duration: result.duration,
        resolution: '1080x1920',
        captionsIncluded: true,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error('[Ad Gen API] Error generating ad:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate ad video',
      },
      { status: 500 }
    );
  }
}
