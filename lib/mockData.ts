import { VideoResult } from '@/types';

export const mockVideoResults: Record<string, VideoResult> = {
  textToVideo: {
    id: 'video-text-001',
    url: '/mock-video.mp4',
    thumbnail: '/mock-thumbnail.jpg',
    duration: 30,
    resolution: '1920x1080',
    captionsIncluded: true,
    createdAt: new Date(),
  },
  imageToVideo: {
    id: 'video-image-001',
    url: '/mock-video.mp4',
    thumbnail: '/mock-thumbnail.jpg',
    duration: 45,
    resolution: '1920x1080',
    captionsIncluded: true,
    createdAt: new Date(),
  },
  videoToVideo: {
    id: 'video-caption-001',
    url: '/mock-video.mp4',
    thumbnail: '/mock-thumbnail.jpg',
    duration: 60,
    resolution: '1920x1080',
    captionsIncluded: true,
    createdAt: new Date(),
  },
};

export const mockCampaignResponse = {
  campaignId: `campaign-${Date.now()}`,
  status: 'active',
  estimatedReach: 50000,
};
