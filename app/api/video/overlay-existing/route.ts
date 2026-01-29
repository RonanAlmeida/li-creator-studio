import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { CaptionOptions } from '@/types';
import type { ImageOverlay } from '@/lib/types/image-overlay';
import { buildSubtitleStyle } from '@/lib/services/ffmpeg.service';

/**
 * POST /api/video/overlay-existing
 * Overlay existing audio, transcript, and images on video
 * Used when audio and transcript are already generated
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, captions, backgroundMusic, imageOverlays } = body;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    console.log(`[API] Overlaying existing audio for job: ${jobId}`);
    console.log('[API] Received imageOverlays:', JSON.stringify(imageOverlays, null, 2));

    // Paths
    const sampleVideoPath = path.join(process.cwd(), 'public', 'generated-videos', 'videos', 'sample_falai_output.mp4');
    const audioPath = path.join(process.cwd(), 'public', 'generated-videos', 'audio', `${jobId}.mp3`);
    const srtPath = path.join(process.cwd(), 'public', 'generated-videos', 'transcripts', `${jobId}.srt`);
    const outputPath = path.join(process.cwd(), 'public', 'generated-videos', 'final', `${jobId}.mp4`);

    // Validate files exist
    if (!fs.existsSync(audioPath)) {
      return NextResponse.json(
        { success: false, error: 'Audio file not found' },
        { status: 400 }
      );
    }

    if (!fs.existsSync(srtPath)) {
      return NextResponse.json(
        { success: false, error: 'Transcript file not found' },
        { status: 400 }
      );
    }

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const captionOptions: CaptionOptions = captions || {
      enabled: true,
      position: 'bottom',
      style: 'bold',
      size: 18,
      color: '#FFFFFF',
      fontFamily: 'Reddit Sans',
    };

    const subtitleStyle = buildSubtitleStyle(captionOptions);
    const escapedSrtPath = srtPath
      .replace(/\\/g, '/')
      .replace(/:/g, '\\:')
      .replace(/ /g, '\\ ');

    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg()
        .input(sampleVideoPath)
        .input(audioPath);

      let nextInputIndex = 2;

      // Add background music if provided
      const hasBackgroundMusic = backgroundMusic && fs.existsSync(
        path.join(process.cwd(), 'public', 'background-music', backgroundMusic)
      );

      if (hasBackgroundMusic) {
        const bgMusicPath = path.join(process.cwd(), 'public', 'background-music', backgroundMusic);
        console.log(`[API] Adding background music: ${bgMusicPath}`);
        command.input(bgMusicPath);
        nextInputIndex++;
      }

      // Add image overlays
      const hasImageOverlays = imageOverlays && imageOverlays.length > 0;
      if (hasImageOverlays) {
        console.log(`[API] Adding ${imageOverlays.length} image overlays`);
        imageOverlays.forEach((overlay: ImageOverlay, index: number) => {
          console.log(`[API] Image ${index}: ${overlay.imagePath} at ${overlay.timestamp}s`);
          if (fs.existsSync(overlay.imagePath)) {
            command.input(overlay.imagePath);
          } else {
            console.warn(`[API] Image not found: ${overlay.imagePath}`);
          }
        });
      }

      // Build filter chain
      const filters: string[] = [];

      // Audio mixing
      if (hasBackgroundMusic) {
        filters.push(
          '[1:a]volume=1.0[narration]',
          '[2:a]volume=0.25[bgmusic]',
          '[narration][bgmusic]amix=inputs=2:duration=shortest[aout]'
        );
      }

      // Subtitles
      let currentVideoLabel = 'v1';
      filters.push(`[0:v]subtitles='${escapedSrtPath}':force_style='${subtitleStyle}'[${currentVideoLabel}]`);

      // Image overlays
      if (hasImageOverlays) {
        imageOverlays.forEach((overlay: ImageOverlay, index: number) => {
          if (fs.existsSync(overlay.imagePath)) {
            const imageInputIndex = nextInputIndex + index;
            const nextVideoLabel = index === imageOverlays.length - 1 ? 'v' : `v${index + 2}`;

            // Center image on screen (both horizontally and vertically)
            filters.push(
              `[${currentVideoLabel}][${imageInputIndex}:v]overlay=x=(W-w)/2:y=(H-h)/2:enable='between(t,${overlay.timestamp},${overlay.timestamp + overlay.duration})'[${nextVideoLabel}]`
            );

            currentVideoLabel = nextVideoLabel;
          }
        });
      } else {
        filters.push(`[${currentVideoLabel}]null[v]`);
      }

      command.complexFilter(filters);

      // Output options
      const outputOptions: string[] = ['-map', '[v]'];

      if (hasBackgroundMusic) {
        outputOptions.push('-map', '[aout]');
      } else {
        outputOptions.push('-map', '1:a');
      }

      outputOptions.push(
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest'
      );

      command.outputOptions(outputOptions);

      command
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log(`[API] ffmpeg command: ${commandLine}`);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`[API] Processing: ${Math.round(progress.percent)}%`);
          }
        })
        .on('end', () => {
          console.log(`[API] Video complete: ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          console.error(`[API] ffmpeg error:`, err);
          reject(err);
        })
        .run();
    });

    // Get audio duration
    const audioStats = fs.statSync(audioPath);
    const duration = 30; // Approximate

    const video = {
      id: jobId,
      url: `/generated-videos/final/${jobId}.mp4`,
      thumbnail: `/generated-videos/videos/sample_falai_output.mp4`,
      duration,
      resolution: '606x1080',
      transcript: '',
      captionsIncluded: true,
      captionOptions,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, video });
  } catch (error) {
    console.error('[API] Overlay error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to overlay video',
      },
      { status: 500 }
    );
  }
}
