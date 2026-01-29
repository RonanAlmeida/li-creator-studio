import { fal } from '@fal-ai/client';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';

export interface VideoGenerationOptions {
  prompt: string;
  imagePath?: string;
  duration?: number;
}

export interface VideoGenerationResult {
  videoPath: string;
  duration: number;
  resolution: string;
  thumbnailPath: string;
}

/**
 * Generate video using fal.ai WAN v2.6 image-to-video model
 */
export async function generateVideo(
  options: VideoGenerationOptions,
  jobId: string
): Promise<VideoGenerationResult> {
  const apiKey = process.env.FAL_KEY || process.env.FAL_AI_API_KEY;

  if (!apiKey) {
    throw new Error('FAL_KEY or FAL_AI_API_KEY not configured');
  }

  console.log(`[fal.ai] Generating video for job ${jobId}`);

  // Set API key for fal client
  process.env.FAL_KEY = apiKey;

  try {
    let result;

    if (options.imagePath) {
      // Image-to-video generation
      console.log(`[fal.ai] Using image-to-video with image: ${options.imagePath}`);

      // Read image and convert to base64 data URL
      const imageBuffer = fs.readFileSync(options.imagePath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = getMimeType(options.imagePath);
      const imageUrl = `data:${mimeType};base64,${base64Image}`;

      // Call fal.ai WAN v2.6 image-to-video model
      result = await fal.subscribe('fal-ai/wan/v2.6/image-to-video/flash', {
        input: {
          image_url: imageUrl,
          prompt: options.prompt,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === 'IN_PROGRESS') {
            console.log(`[fal.ai] Processing... ${update.logs?.map(l => l.message).join(', ')}`);
          }
        },
      });
    } else {
      // Text-to-video: First generate an image, then convert to video
      // For now, we'll throw an error asking user to provide an image
      // In future, could integrate DALL-E or Stable Diffusion to generate image first
      throw new Error('Text-to-video requires image generation step. Please use image-to-video instead.');
    }

    // Download generated video
    const videoUrl = result.data.video.url;
    console.log(`[fal.ai] Video generated: ${videoUrl}`);

    // Download video to local storage
    const videoDir = path.join(process.cwd(), 'public', 'generated-videos', 'videos');
    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
    }

    const videoPath = path.join(videoDir, `${jobId}.mp4`);
    await downloadFile(videoUrl, videoPath);

    console.log(`[fal.ai] Video saved to ${videoPath}`);

    // Generate thumbnail
    const thumbnailPath = await generateThumbnail(videoPath, jobId);

    // Get video metadata (duration, resolution)
    const { duration, resolution } = await getVideoMetadata(videoPath);

    return {
      videoPath,
      duration,
      resolution,
      thumbnailPath,
    };
  } catch (error) {
    console.error('[fal.ai] Error generating video:', error);
    throw new Error(`Failed to generate video: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Download file from URL to local path
 */
async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await axios({
    method: 'GET',
    url,
    responseType: 'stream',
  });

  const writer = fs.createWriteStream(outputPath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

/**
 * Generate thumbnail from video using sharp
 */
async function generateThumbnail(videoPath: string, jobId: string): Promise<string> {
  const videoDir = path.dirname(videoPath);
  const thumbnailPath = path.join(videoDir, `${jobId}_thumb.jpg`);

  try {
    // Use ffmpeg to extract first frame
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    await execAsync(
      `ffmpeg -i "${videoPath}" -vframes 1 -f image2 "${thumbnailPath}"`
    );

    console.log(`[fal.ai] Thumbnail generated: ${thumbnailPath}`);
    return thumbnailPath;
  } catch (error) {
    console.error('[fal.ai] Error generating thumbnail:', error);
    // Return empty thumbnail path if generation fails
    return '';
  }
}

/**
 * Get video metadata (duration and resolution) using ffprobe
 */
async function getVideoMetadata(videoPath: string): Promise<{ duration: number; resolution: string }> {
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    // Get duration
    const { stdout: durationOut } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`
    );
    const duration = parseFloat(durationOut.trim());

    // Get resolution
    const { stdout: resolutionOut } = await execAsync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${videoPath}"`
    );
    const resolution = resolutionOut.trim();

    return { duration, resolution };
  } catch (error) {
    console.warn('[fal.ai] Could not get video metadata, using defaults');
    return { duration: 30, resolution: '1920x1080' };
  }
}

/**
 * Get MIME type from file extension
 */
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  return mimeTypes[ext] || 'image/jpeg';
}
