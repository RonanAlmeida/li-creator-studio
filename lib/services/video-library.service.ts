import fs from 'fs';
import path from 'path';

interface VideoMetadata {
  title: string;
  duration: number;
  createdAt: string;
  transcript: string;
}

/**
 * Copy video from /final to public /videos library
 * and save metadata
 */
export async function addVideoToLibrary(
  jobId: string,
  title: string,
  transcript: string,
  duration: number
): Promise<void> {
  try {
    const finalVideoPath = path.join(
      process.cwd(),
      'public',
      'generated-videos',
      'final',
      `${jobId}.mp4`
    );

    const videosDir = path.join(process.cwd(), 'public', 'videos');
    const publicVideoPath = path.join(videosDir, `${jobId}.mp4`);
    const metadataPath = path.join(videosDir, 'metadata.json');

    // Ensure videos directory exists
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true });
    }

    // Copy video file
    if (fs.existsSync(finalVideoPath)) {
      fs.copyFileSync(finalVideoPath, publicVideoPath);
      console.log(`[Video Library] Copied video to library: ${jobId}`);
    } else {
      console.warn(`[Video Library] Source video not found: ${finalVideoPath}`);
      return;
    }

    // Load existing metadata
    let metadata: Record<string, VideoMetadata> = {};
    if (fs.existsSync(metadataPath)) {
      const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
      metadata = JSON.parse(metadataContent);
    }

    // Add new video metadata
    metadata[jobId] = {
      title,
      duration,
      createdAt: new Date().toISOString(),
      transcript: transcript.slice(0, 200), // First 200 chars
    };

    // Save metadata
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    console.log(`[Video Library] Added metadata for: ${jobId}`);
  } catch (error) {
    console.error('[Video Library] Error adding video to library:', error);
    // Don't throw - this is a non-critical operation
  }
}
