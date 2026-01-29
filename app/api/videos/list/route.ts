import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const videosDir = path.join(process.cwd(), 'public', 'videos');
    const metadataPath = path.join(videosDir, 'metadata.json');

    // Ensure directories exist
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true });
    }

    // Load metadata
    let metadata: any = {};
    if (fs.existsSync(metadataPath)) {
      const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
      metadata = JSON.parse(metadataContent);
    }

    // Get all video files
    const files = fs.readdirSync(videosDir).filter(file => file.endsWith('.mp4'));

    // Build video list with metadata
    const videos = files.map(file => {
      const videoId = file.replace('.mp4', '');
      const videoMetadata = metadata[videoId] || {};

      return {
        id: videoId,
        title: videoMetadata.title || 'Untitled Video',
        url: `/videos/${file}`,
        thumbnail: `/videos/${file}`,
        duration: videoMetadata.duration || 30,
        createdAt: videoMetadata.createdAt || new Date().toISOString(),
        transcript: videoMetadata.transcript || 'No transcript available',
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
