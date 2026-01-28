'use client';

import { useState } from 'react';
import { CaptionOptions, VideoResult } from '@/types';
import { CAPTION_DEFAULTS, TEXT_LIMITS } from '@/lib/constants';
import { validateTextLength } from '@/lib/utils';
import { generateTextToVideo } from '@/lib/api';
import TextInput from '../forms/TextInput';
import CaptionCustomizer from '../forms/CaptionCustomizer';
import Button from '../forms/Button';
import Card from '../ui/Card';

interface TextToVideoProps {
  onVideoGenerated: (video: VideoResult) => void;
  onError: (error: string) => void;
}

export default function TextToVideo({ onVideoGenerated, onError }: TextToVideoProps) {
  const [text, setText] = useState('');
  const [captionOptions, setCaptionOptions] = useState<CaptionOptions>(CAPTION_DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleGenerate = async () => {
    const validation = validateTextLength(text, TEXT_LIMITS.min, TEXT_LIMITS.max);
    if (!validation.valid) {
      setError(validation.error);
      onError(validation.error || 'Invalid text');
      return;
    }

    setError(undefined);
    setLoading(true);

    try {
      const video = await generateTextToVideo(text, captionOptions);
      onVideoGenerated(video);
    } catch (err) {
      const errorMsg = 'Failed to generate video. Please try again.';
      setError(errorMsg);
      onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold text-linkedin-gray-900 mb-4">
        Transform Text into Video
      </h2>
      <p className="text-sm text-linkedin-gray-600 mb-6">
        Paste your text content and we'll create a professional video with optional captions.
      </p>

      <div className="space-y-6">
        <TextInput
          value={text}
          onChange={setText}
          placeholder="Enter your post text here... (min 10 characters)"
          rows={8}
          error={error}
        />

        <CaptionCustomizer
          options={captionOptions}
          onChange={setCaptionOptions}
        />

        <Button
          onClick={handleGenerate}
          loading={loading}
          disabled={text.length < TEXT_LIMITS.min}
          className="w-full"
        >
          {loading ? 'Generating Video...' : 'Generate Video'}
        </Button>
      </div>
    </Card>
  );
}
