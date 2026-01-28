'use client';

import { useState } from 'react';
import { CaptionOptions, VideoResult } from '@/types';
import { CAPTION_DEFAULTS } from '@/lib/constants';
import { generateVideoCaptions } from '@/lib/api';
import VideoUpload from '../forms/VideoUpload';
import CaptionCustomizer from '../forms/CaptionCustomizer';
import Button from '../forms/Button';
import Card from '../ui/Card';

interface VideoToVideoProps {
  onVideoGenerated: (video: VideoResult) => void;
  onError: (error: string) => void;
}

export default function VideoToVideo({ onVideoGenerated, onError }: VideoToVideoProps) {
  const [video, setVideo] = useState<File | null>(null);
  const [captionOptions, setCaptionOptions] = useState<CaptionOptions>(CAPTION_DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [videoError, setVideoError] = useState<string>();

  const handleGenerate = async () => {
    if (!video) {
      setVideoError('Please upload a video');
      onError('Please upload a video');
      return;
    }

    if (!captionOptions.enabled) {
      onError('Please enable captions to process the video');
      return;
    }

    setVideoError(undefined);
    setLoading(true);

    try {
      const result = await generateVideoCaptions(video, captionOptions);
      onVideoGenerated(result);
    } catch (err) {
      const errorMsg = 'Failed to generate captions. Please try again.';
      onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold text-linkedin-gray-900 mb-4">
        Add AI Captions to Your Video
      </h2>
      <p className="text-sm text-linkedin-gray-600 mb-6">
        Upload your video and we'll automatically generate and add customizable captions.
      </p>

      <div className="space-y-6">
        <VideoUpload
          onVideoSelect={setVideo}
          onVideoRemove={() => setVideo(null)}
          selectedVideo={video}
          error={videoError}
        />

        <CaptionCustomizer
          options={captionOptions}
          onChange={setCaptionOptions}
        />

        <Button
          onClick={handleGenerate}
          loading={loading}
          disabled={!video || !captionOptions.enabled}
          className="w-full"
        >
          {loading ? 'Generating Captions...' : 'Generate Captions'}
        </Button>
      </div>
    </Card>
  );
}
