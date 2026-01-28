import { VideoResult, CaptionOptions, CampaignData } from '@/types';
import { mockVideoResults, mockCampaignResponse } from './mockData';
import { simulateDelay, generateId } from './utils';

// Mock video generation functions
export async function generateTextToVideo(
  text: string,
  captions?: CaptionOptions
): Promise<VideoResult> {
  // TODO: Replace with actual API
  const result = {
    ...mockVideoResults.textToVideo,
    id: generateId(),
    captionsIncluded: captions?.enabled || false,
    captionOptions: captions,
    createdAt: new Date(),
  };
  return simulateDelay(2000, result);
}

export async function generateImageToVideo(
  text: string,
  image: File,
  captions?: CaptionOptions
): Promise<VideoResult> {
  // TODO: Replace with actual API
  const result = {
    ...mockVideoResults.imageToVideo,
    id: generateId(),
    captionsIncluded: captions?.enabled || false,
    captionOptions: captions,
    createdAt: new Date(),
  };
  return simulateDelay(3000, result);
}

export async function generateVideoCaptions(
  video: File,
  options: CaptionOptions
): Promise<VideoResult> {
  // TODO: Replace with OpenAI Whisper API
  const result = {
    ...mockVideoResults.videoToVideo,
    id: generateId(),
    captionsIncluded: options.enabled,
    captionOptions: options,
    createdAt: new Date(),
  };
  return simulateDelay(4000, result);
}

export async function createLinkedInCampaign(
  campaignData: CampaignData
): Promise<{ campaignId: string; status: string; estimatedReach: number }> {
  // TODO: Replace with LinkedIn Campaign API
  return simulateDelay(1500, {
    ...mockCampaignResponse,
    campaignId: generateId(),
  });
}
