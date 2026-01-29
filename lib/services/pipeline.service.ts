import { generateAudioFromText } from './elevenlabs.service';
import { transcribeAudio } from './whisper.service';
import { generateVideo } from './video-generation.service';
import { overlaySubtitles } from './ffmpeg.service';
import { CaptionOptions } from '@/types';
import path from 'path';

export interface VideoResult {
  id: string;
  url: string;
  thumbnail: string;
  duration: number;
  resolution: string;
  transcript: string;
  createdAt: string;
}

/**
 * Execute the complete video generation pipeline
 * Flow: Text → Audio → Transcription → Video → Captions → Final Video
 */
export async function executeVideoPipeline(
  text: string,
  imagePath: string | undefined,
  captionOptions: CaptionOptions | undefined,
  jobId: string
): Promise<VideoResult> {
  console.log(`[Pipeline] Starting video generation pipeline for job ${jobId}`);
  console.log(`[Pipeline] Text length: ${text.length} characters`);
  console.log(`[Pipeline] Image provided: ${!!imagePath}`);
  console.log(`[Pipeline] Captions enabled: ${!!captionOptions}`);

  try {
    // Step 1: Generate audio from text using ElevenLabs
    console.log(`[Pipeline] Step 1/4: Generating audio narration...`);
    const { audioPath, duration: audioDuration } = await generateAudioFromText(text, jobId);
    console.log(`[Pipeline] ✓ Audio generated: ${audioPath} (${audioDuration}s)`);

    // Step 2: Transcribe audio using OpenAI Whisper
    console.log(`[Pipeline] Step 2/4: Transcribing audio...`);
    const { srtPath, segments } = await transcribeAudio(audioPath, jobId);
    console.log(`[Pipeline] ✓ Transcription complete: ${srtPath} (${segments.length} segments)`);

    // Step 3: Generate video using fal.ai
    console.log(`[Pipeline] Step 3/4: Creating video...`);
    const {
      videoPath,
      duration: videoDuration,
      resolution,
      thumbnailPath,
    } = await generateVideo(
      {
        prompt: text,
        imagePath,
        duration: audioDuration,
      },
      jobId
    );
    console.log(`[Pipeline] ✓ Video generated: ${videoPath} (${videoDuration}s, ${resolution})`);

    let finalVideoPath = videoPath;

    // Step 4: Overlay captions if enabled
    if (captionOptions) {
      console.log(`[Pipeline] Step 4/4: Adding captions...`);
      const outputPath = path.join(
        process.cwd(),
        'public',
        'generated-videos',
        'final',
        `${jobId}.mp4`
      );

      finalVideoPath = await overlaySubtitles(videoPath, srtPath, captionOptions, outputPath);
      console.log(`[Pipeline] ✓ Captions overlayed: ${finalVideoPath}`);
    } else {
      console.log(`[Pipeline] Step 4/4: Skipping captions (not enabled)`);
      // Copy video to final directory even without captions
      const fs = require('fs');
      const outputPath = path.join(
        process.cwd(),
        'public',
        'generated-videos',
        'final',
        `${jobId}.mp4`
      );
      fs.copyFileSync(videoPath, outputPath);
      finalVideoPath = outputPath;
    }

    // Step 5: Construct result with public URLs
    const baseUrl = '/generated-videos';
    const result: VideoResult = {
      id: jobId,
      url: `${baseUrl}/final/${jobId}.mp4`,
      thumbnail: thumbnailPath
        ? `${baseUrl}/videos/${path.basename(thumbnailPath)}`
        : `${baseUrl}/videos/${jobId}_thumb.jpg`,
      duration: videoDuration || audioDuration,
      resolution,
      transcript: segments.map((s) => s.text).join(' '),
      createdAt: new Date().toISOString(),
    };

    console.log(`[Pipeline] ✅ Pipeline complete! Video ready at ${result.url}`);
    return result;
  } catch (error) {
    console.error(`[Pipeline] ❌ Pipeline failed for job ${jobId}:`, error);
    throw new Error(
      `Video generation pipeline failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate unique job ID for tracking
 */
export function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}
