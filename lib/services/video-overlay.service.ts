import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { CaptionOptions } from '@/types';
import { generateAudioFromText } from './elevenlabs.service';
import { transcribeAudio } from './whisper.service';
import { buildSubtitleStyle } from './ffmpeg.service';

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
  jobId: string
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

    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(videoPath)
        .input(audioPath)
        .outputOptions([
          '-map', '0:v',           // Video from first input (original video)
          '-map', '1:a',           // Audio from second input (generated audio)
          '-c:v', 'libx264',       // Re-encode video (needed for subtitle overlay)
          '-preset', 'fast',       // Encoding speed
          '-crf', '23',            // Quality (lower = better, 18-28 recommended)
          '-vf', `subtitles=${srtPath}:force_style='${subtitleStyle}'`, // Subtitle overlay
          '-c:a', 'aac',           // Audio codec
          '-b:a', '192k',          // Audio bitrate
          '-shortest',             // Match shortest input duration
        ])
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
