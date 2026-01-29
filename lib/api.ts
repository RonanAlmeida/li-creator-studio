import { VideoResult, CaptionOptions, CampaignData } from '@/types';
import { mockVideoResults, mockCampaignResponse } from './mockData';
import { simulateDelay, generateId } from './utils';

// Video generation functions
export async function generateTextToVideo(
  text: string,
  captions?: CaptionOptions
): Promise<VideoResult> {
  const response = await fetch('/api/video/text-to-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, captions }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate video');
  }

  const data = await response.json();
  return data.video;
}

export async function generateImageToVideo(
  text: string,
  image: File,
  captions?: CaptionOptions
): Promise<VideoResult> {
  const formData = new FormData();
  formData.append('text', text);
  formData.append('image', image);
  if (captions) {
    formData.append('captions', JSON.stringify(captions));
  }

  const response = await fetch('/api/video/image-to-video', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate video');
  }

  const data = await response.json();
  return data.video;
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

export async function overlayAudioAndCaptions(
  text: string,
  voiceId: string,
  captions?: CaptionOptions,
  backgroundMusic?: string
): Promise<VideoResult> {
  const response = await fetch('/api/video/overlay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voiceId, captions, backgroundMusic }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to overlay audio and captions');
  }

  const data = await response.json();
  return data.video;
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
