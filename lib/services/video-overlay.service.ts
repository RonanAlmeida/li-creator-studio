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
  jobId: string,
  backgroundMusicPath?: string
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

      // Add background music if provided
      if (backgroundMusicPath && fs.existsSync(backgroundMusicPath)) {
        console.log(`[Video Overlay] Adding background music: ${backgroundMusicPath}`);
        command.input(backgroundMusicPath);

        // Mix narration (100% volume) with background music (25% volume)
        command
          .complexFilter([
            '[1:a]volume=1.0[narration]',        // Narration at full volume
            '[2:a]volume=0.25[bgmusic]',         // Background music at 25% volume
            '[narration][bgmusic]amix=inputs=2:duration=shortest[aout]', // Mix both
            `[0:v]subtitles='${escapedSrtPath}':force_style='${subtitleStyle}'[v]`, // Apply subtitles
          ])
          .outputOptions([
            '-map', '[v]',                       // Video with subtitles
            '-map', '[aout]',                    // Mixed audio output
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-shortest',
          ]);
      } else {
        // No background music - just narration with subtitles in complex filter
        command
          .complexFilter([
            `[0:v]subtitles='${escapedSrtPath}':force_style='${subtitleStyle}'[v]`, // Apply subtitles
          ])
          .outputOptions([
            '-map', '[v]',
            '-map', '1:a',
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-shortest',
          ]);
      }

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
