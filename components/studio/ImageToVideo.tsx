'use client';

import { useState } from 'react';
import { CaptionOptions, VideoResult } from '@/types';
import { CAPTION_DEFAULTS, TEXT_LIMITS } from '@/lib/constants';
import { validateTextLength } from '@/lib/utils';
import { generateImageToVideo } from '@/lib/api';
import TextInput from '../forms/TextInput';
import ImageUpload from '../forms/ImageUpload';
import CaptionCustomizer from '../forms/CaptionCustomizer';
import Button from '../forms/Button';
import Card from '../ui/Card';

interface ImageToVideoProps {
  onVideoGenerated: (video: VideoResult) => void;
  onError: (error: string) => void;
}

export default function ImageToVideo({ onVideoGenerated, onError }: ImageToVideoProps) {
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [captionOptions, setCaptionOptions] = useState<CaptionOptions>(CAPTION_DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [textError, setTextError] = useState<string>();
  const [imageError, setImageError] = useState<string>();

  const handleGenerate = async () => {
    const validation = validateTextLength(text, TEXT_LIMITS.min, TEXT_LIMITS.max);
    if (!validation.valid) {
      setTextError(validation.error);
      onError(validation.error || 'Invalid text');
      return;
    }

    if (!image) {
      setImageError('Please upload an image');
      onError('Please upload an image');
      return;
    }

    setTextError(undefined);
    setImageError(undefined);
    setLoading(true);

    try {
      const video = await generateImageToVideo(text, image, captionOptions);
      onVideoGenerated(video);
    } catch (err) {
      const errorMsg = 'Failed to generate video. Please try again.';
      onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold text-linkedin-gray-900 mb-4">
        Create Video from Text & Image
      </h2>
      <p className="text-sm text-linkedin-gray-600 mb-6">
        Combine your text content with an image to create an engaging video.
      </p>

      <div className="space-y-6">
        <TextInput
          value={text}
          onChange={setText}
          placeholder="Enter your post text here... (min 10 characters)"
          rows={6}
          error={textError}
        />

        <ImageUpload
          onImageSelect={setImage}
          onImageRemove={() => setImage(null)}
          selectedImage={image}
          error={imageError}
        />

        <CaptionCustomizer
          options={captionOptions}
          onChange={setCaptionOptions}
        />

        <Button
          onClick={handleGenerate}
          loading={loading}
          disabled={text.length < TEXT_LIMITS.min || !image}
          className="w-full"
        >
          {loading ? 'Generating Video...' : 'Generate Video'}
        </Button>
      </div>
    </Card>
  );
}
