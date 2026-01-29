'use client';

import { useState } from 'react';
import { ImageGenerator } from '@/components/studio/ImageGenerator';
import type { TranscriptLine, ImageOverlay } from '@/lib/types/image-overlay';

interface Step6ImagesProps {
  transcriptLines: TranscriptLine[];
  jobId: string;
  scriptText: string; // Need this to estimate timings
  imageOverlays: ImageOverlay[];
  onComplete: (overlays: ImageOverlay[]) => void;
  onSkip: () => void;
}

export default function Step6Images({
  transcriptLines,
  jobId,
  scriptText,
  imageOverlays,
  onComplete,
  onSkip,
}: Step6ImagesProps) {
  const [showGenerator, setShowGenerator] = useState(false);
  const [estimatedLines, setEstimatedLines] = useState<TranscriptLine[]>([]);

  const estimateLineTimings = (script: string): TranscriptLine[] => {
    // Split script into sentences
    const sentences = script.split(/[.!?]+/).filter(s => s.trim().length > 0);

    // Estimate ~150 words per minute speaking rate = 2.5 words per second
    const wordsPerSecond = 2.5;
    let currentTime = 0;
    const lines: TranscriptLine[] = [];

    sentences.forEach((sentence) => {
      const text = sentence.trim();
      if (text.length === 0) return;

      const wordCount = text.split(/\s+/).length;
      const duration = wordCount / wordsPerSecond;

      lines.push({
        text,
        startTime: currentTime,
        endTime: currentTime + duration,
      });

      currentTime += duration;
    });

    return lines;
  };

  const handleStartGeneration = () => {
    // Estimate line timings from script
    const lines = estimateLineTimings(scriptText);
    setEstimatedLines(lines);
    setShowGenerator(true);
  };

  const handleImagesGenerated = (overlays: ImageOverlay[]) => {
    onComplete(overlays);
  };

  if (showGenerator && estimatedLines.length > 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Images</h2>
          <p className="text-gray-600">
            Customize prompts and timing for each image overlay
          </p>
        </div>

        <ImageGenerator
          transcriptLines={estimatedLines}
          jobId={jobId}
          onImagesGenerated={handleImagesGenerated}
          onSkip={onSkip}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Images</h2>
        <p className="text-gray-600">
          Enhance your video with AI-generated image overlays (optional)
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-[#0A66C2] to-[#004182] rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Generate Image Overlays
            </h3>
            <p className="text-gray-600 max-w-md">
              Add visual interest to your video with AI-generated images that match your
              script. Images will be automatically timed to appear at the right moments.
            </p>
          </div>

          {imageOverlays.length > 0 && (
            <div className="w-full max-w-md bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900">
                {imageOverlays.length} image{imageOverlays.length !== 1 ? 's' : ''} ready
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleStartGeneration}
              className="px-6 py-3 rounded-lg font-medium bg-gradient-to-r from-[#0A66C2] to-[#004182] text-white hover:shadow-lg active:scale-95 transition-all"
            >
              Add Images
            </button>

            <button
              onClick={onSkip}
              className="px-6 py-3 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95 transition-all"
            >
              Skip
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-[#0A66C2] flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1 a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Image Tips</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Images are generated based on your script content</li>
              <li>• You can customize prompts and timing for each image</li>
              <li>• Skip this step if you prefer a video without images</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
