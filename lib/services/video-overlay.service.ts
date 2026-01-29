import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { CaptionOptions } from '@/types';
import { generateAudioFromText } from './elevenlabs.service';
import { transcribeAudio } from './whisper.service';
import { buildSubtitleStyle } from './ffmpeg.service';
import type { ImageOverlay } from '@/lib/types/image-overlay';

export interface VideoOverlayResult {
  videoPath: string;
  audioPath: string;
  srtPath: string;
  duration: number;
}

/**
 * Overlay audio narration and captions on an existing video
 */
export async function overlayAudioAndCaptions(
  videoPath: string,
  text: string,
  voiceId: string,
  captionOptions: CaptionOptions,
  jobId: string,
  backgroundMusicPath?: string,
  imageOverlays?: ImageOverlay[]
): Promise<VideoOverlayResult> {
  console.log(`[Video Overlay] Starting audio and caption overlay for job ${jobId}`);
  console.log(`[Video Overlay] Input video: ${videoPath}`);
  console.log(`[Video Overlay] Voice ID: ${voiceId}`);

  try {
    // Step 1: Generate audio from text using ElevenLabs with selected voice
    console.log(`[Video Overlay] Step 1/3: Generating audio narration...`);
    const { audioPath, duration } = await generateAudioFromText(text, jobId, voiceId);
    console.log(`[Video Overlay] ✓ Audio generated: ${audioPath}`);

    // Step 2: Transcribe audio using Whisper
    console.log(`[Video Overlay] Step 2/3: Transcribing audio...`);
    const { srtPath } = await transcribeAudio(audioPath, jobId);
    console.log(`[Video Overlay] ✓ Transcription complete: ${srtPath}`);

    // Step 3: Overlay both audio and captions on video
    console.log(`[Video Overlay] Step 3/3: Overlaying audio and captions on video...`);
    const outputPath = path.join(
      process.cwd(),
      'public',
      'generated-videos',
      'final',
      `${jobId}.mp4`
    );

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Build subtitle style
    const subtitleStyle = buildSubtitleStyle(captionOptions);

    // Escape the SRT path for ffmpeg filter syntax
    // Replace backslashes with forward slashes, escape colons and spaces
    const escapedSrtPath = srtPath
      .replace(/\\/g, '/')
      .replace(/:/g, '\\:')
      .replace(/ /g, '\\ ');

    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg()
        .input(videoPath)
        .input(audioPath);

      // Track input indices for ffmpeg
      let nextInputIndex = 2; // 0=video, 1=audio, 2=next

      // Add background music if provided
      const hasBackgroundMusic = backgroundMusicPath && fs.existsSync(backgroundMusicPath);
      if (hasBackgroundMusic) {
        console.log(`[Video Overlay] Adding background music: ${backgroundMusicPath}`);
        command.input(backgroundMusicPath);
        nextInputIndex++;
      }

      // Add image overlays as inputs
      const hasImageOverlays = imageOverlays && imageOverlays.length > 0;
      if (hasImageOverlays) {
        console.log(`[Video Overlay] Adding ${imageOverlays.length} image overlays`);
        imageOverlays.forEach((overlay, index) => {
          if (!fs.existsSync(overlay.imagePath)) {
            console.warn(`[Video Overlay] Warning: Image not found: ${overlay.imagePath}`);
          } else {
            command.input(overlay.imagePath);
            console.log(`[Video Overlay] Image ${index + 1}: ${overlay.imagePath} at ${overlay.timestamp}s`);
          }
        });
      }

      // Build complex filter chain
      const filters: string[] = [];

      // Audio mixing
      if (hasBackgroundMusic) {
        filters.push(
          '[1:a]volume=1.0[narration]',        // Narration at full volume
          '[2:a]volume=0.25[bgmusic]',         // Background music at 25% volume
          '[narration][bgmusic]amix=inputs=2:duration=shortest[aout]' // Mix both
        );
      }

      // Apply subtitles first
      let currentVideoLabel = 'v1';
      filters.push(`[0:v]subtitles='${escapedSrtPath}':force_style='${subtitleStyle}'[${currentVideoLabel}]`);

      // Add image overlays
      if (hasImageOverlays) {
        imageOverlays.forEach((overlay, index) => {
          if (fs.existsSync(overlay.imagePath)) {
            const imageInputIndex = nextInputIndex + index;
            const nextVideoLabel = index === imageOverlays.length - 1 ? 'v' : `v${index + 2}`;
            const startTime = overlay.timestamp;
            const endTime = overlay.timestamp + overlay.duration;

            // Position: center horizontally, slightly above center vertically
            filters.push(
              `[${currentVideoLabel}][${imageInputIndex}:v]overlay=x=(W-w)/2:y=(H-h)/2.5:enable='between(t,${startTime},${endTime})'[${nextVideoLabel}]`
            );

            currentVideoLabel = nextVideoLabel;
          }
        });
      } else {
        // No image overlays, rename final video output
        filters.push(`[${currentVideoLabel}]null[v]`);
      }

      // Apply complex filter
      command.complexFilter(filters);

      // Output options
      const outputOptions: string[] = [
        '-map', '[v]',                       // Video with subtitles and overlays
      ];

      // Add audio mapping
      if (hasBackgroundMusic) {
        outputOptions.push('-map', '[aout]');  // Mixed audio output
      } else {
        outputOptions.push('-map', '1:a');     // Just narration
      }

      // Add codec and quality settings
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
          console.log(`[Video Overlay] Command: ${commandLine}`);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`[Video Overlay] Processing: ${Math.round(progress.percent)}%`);
          }
        })
        .on('end', () => {
          console.log(`[Video Overlay] ✓ Overlay complete: ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          console.error(`[Video Overlay] Error:`, err);
          reject(new Error(`ffmpeg failed: ${err.message}`));
        })
        .run();
    });

    return {
      videoPath: outputPath,
      audioPath,
      srtPath,
      duration,
    };
  } catch (error) {
    console.error('[Video Overlay] Error:', error);
    throw new Error(
      `Failed to overlay audio and captions: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
