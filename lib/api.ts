import { VideoResult, CaptionOptions, CampaignData } from '@/types';
import { mockVideoResults, mockCampaignResponse } from './mockData';
import { simulateDelay, generateId } from './utils';
import type { ImageOverlay } from '@/lib/types/image-overlay';

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

export async function transcribeAudioWithTimestamps(
  text: string,
  voiceId: string
): Promise<{
  jobId: string;
  duration: number;
  audioPath: string;
  srtPath: string;
  transcriptLines: Array<{ text: string; startTime: number; endTime: number }>;
}> {
  const response = await fetch('/api/audio/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voiceId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to transcribe audio');
  }

  return await response.json();
}

export async function overlayExistingAudio(
  jobId: string,
  captions?: CaptionOptions,
  backgroundMusic?: string,
  imageOverlays?: ImageOverlay[]
): Promise<VideoResult> {
  console.log('[API Client] overlayExistingAudio called with:', {
    jobId,
    captionsEnabled: captions?.enabled,
    backgroundMusic,
    imageOverlaysCount: imageOverlays?.length || 0,
    imageOverlays,
  });

  const response = await fetch('/api/video/overlay-existing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobId, captions, backgroundMusic, imageOverlays }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to overlay video');
  }

  const data = await response.json();
  return data.video;
}

export async function overlayAudioAndCaptions(
  text: string,
  voiceId: string,
  captions?: CaptionOptions,
  backgroundMusic?: string,
  imageOverlays?: ImageOverlay[]
): Promise<VideoResult> {
  const response = await fetch('/api/video/overlay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voiceId, captions, backgroundMusic, imageOverlays }),
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
