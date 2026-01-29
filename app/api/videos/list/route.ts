import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read from generated-videos/final folder where videos are actually created
    const videosDir = path.join(process.cwd(), 'public', 'generated-videos', 'final');

    // Ensure directory exists
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true });
    }

    // Get all video files
    const files = fs.readdirSync(videosDir).filter(file => file.endsWith('.mp4'));

    // Build video list with metadata from file stats
    const videos = files.map(file => {
      const videoId = file.replace('.mp4', '');
      const filePath = path.join(videosDir, file);
      const stats = fs.statSync(filePath);

      return {
        id: videoId,
        title: videoId.replace(/^job_\d+_/, '').replace(/_/g, ' ') || 'Untitled Video',
        url: `/generated-videos/final/${file}`,
        thumbnail: `/generated-videos/final/${file}`,
        duration: 0, // We don't have duration metadata, will be 0 for now
        createdAt: stats.birthtime.toISOString(),
        transcript: 'Generated video',
      };
    });

    // Sort by creation date (newest first)
    videos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      videos,
    });
  } catch (error) {
    console.error('[API] Error listing videos:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list videos',
        videos: [],
      },
      { status: 500 }
    );
  }
}
