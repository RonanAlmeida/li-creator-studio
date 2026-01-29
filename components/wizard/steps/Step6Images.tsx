'use client';

import { useState } from 'react';

interface TranscriptLine {
  text: string;
  start: number;
  end: number;
}

interface ImageOverlay {
  prompt: string;
  imageUrl: string;
  timestamp: number;
  duration: number;
}

interface Step6ImagesProps {
  transcriptLines: TranscriptLine[];
  jobId: string; // This is the audio job ID, not video
  imageOverlays: ImageOverlay[];
  onComplete: (overlays: ImageOverlay[]) => void;
  onSkip: () => void;
}

export default function Step6Images({
  transcriptLines,
  jobId,
  imageOverlays,
  onComplete,
  onSkip,
}: Step6ImagesProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOverlays, setGeneratedOverlays] = useState<ImageOverlay[]>(imageOverlays);

  const handleAddImages = async () => {
    setIsGenerating(true);

    try {
      // This would normally open the ImageGenerator modal
      // For now, we'll simulate the process
      // In the actual implementation, this would integrate with the existing ImageGenerator component

      // Placeholder: simulate image generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For now, just complete with existing overlays
      onComplete(generatedOverlays);
    } catch (error) {
      console.error('Error generating images:', error);
      alert('Failed to generate images. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

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

          {generatedOverlays.length > 0 && (
            <div className="w-full max-w-md bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900">
                {generatedOverlays.length} image{generatedOverlays.length !== 1 ? 's' : ''} ready
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleAddImages}
              disabled={isGenerating}
              className={`
                px-6 py-3 rounded-lg font-medium transition-all
                ${
                  isGenerating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#0A66C2] to-[#004182] text-white hover:shadow-lg active:scale-95'
                }
              `}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generating...
                </span>
              ) : (
                'Add Images'
              )}
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
              <li>• You can skip this step if you prefer a video without images</li>
              <li>• Images will be automatically positioned for best visual impact</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
