'use client';

import { CaptionOptions, VideoResult } from '@/types';

interface ImageOverlay {
  prompt: string;
  imageUrl: string;
  timestamp: number;
  duration: number;
}

interface TranscriptLine {
  text: string;
  start: number;
  end: number;
}

interface WizardState {
  currentStep: number;
  completedSteps: Set<number>;
  generationType: 'text-to-video' | 'image-to-video' | 'video-to-video';
  scriptText: string;
  captionText: string;
  uploadedFile: File | null;
  hashtags: string;
  selectedVoiceId: string;
  selectedMusicId: string;
  captionOptions: CaptionOptions;
  imageOverlays: ImageOverlay[];
  transcriptLines: TranscriptLine[];
  isGenerating: boolean;
  loadingStage: string;
  generatedVideo: VideoResult | null;
}

interface Step7ReviewProps {
  wizardState: WizardState;
  onEdit: (step: number) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  loadingStage: string;
}

export default function Step7Review({
  wizardState,
  onEdit,
  onGenerate,
  isGenerating,
  loadingStage,
}: Step7ReviewProps) {
  const getVoiceName = (voiceId: string) => {
    // This would come from the voices constants
    const voiceMap: Record<string, string> = {
      alloy: 'Alloy',
      echo: 'Echo',
      fable: 'Fable',
      onyx: 'Onyx',
      nova: 'Nova',
      shimmer: 'Shimmer',
    };
    return voiceMap[voiceId] || voiceId;
  };

  const getMusicName = (musicId: string) => {
    if (musicId === 'none') return 'None';
    // This would come from the music constants
    return musicId;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Generate</h2>
        <p className="text-gray-600">
          Review your selections and generate your video
        </p>
      </div>

      {isGenerating ? (
        <div className="border-2 border-[#0A66C2] rounded-lg p-12 bg-blue-50">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-[#0A66C2] border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0A66C2] to-[#004182] rounded-full" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Creating Your Video
              </h3>
              <p className="text-gray-600">{loadingStage}</p>
            </div>
            <div className="w-full max-w-md bg-white rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#0A66C2] to-[#004182] animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Script Section */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-[#0A66C2] transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-[#0A66C2]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Script
                </h3>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {wizardState.scriptText}
                </p>
                {wizardState.captionText && (
                  <p className="text-sm text-gray-500 mt-1">
                    Title: {wizardState.captionText}
                  </p>
                )}
                {wizardState.uploadedFile && (
                  <p className="text-sm text-[#0A66C2] mt-1">
                    File: {wizardState.uploadedFile.name}
                  </p>
                )}
              </div>
              <button
                onClick={() => onEdit(1)}
                className="text-[#0A66C2] hover:text-[#004182] font-medium text-sm"
              >
                Edit
              </button>
            </div>
          </div>

          {/* Hashtags Section */}
          {wizardState.hashtags && (
            <div className="border border-gray-200 rounded-lg p-4 hover:border-[#0A66C2] transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-[#0A66C2]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                      />
                    </svg>
                    Hashtags
                  </h3>
                  <p className="text-sm text-gray-700">{wizardState.hashtags}</p>
                </div>
                <button
                  onClick={() => onEdit(2)}
                  className="text-[#0A66C2] hover:text-[#004182] font-medium text-sm"
                >
                  Edit
                </button>
              </div>
            </div>
          )}

          {/* Voice & Music Section */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-[#0A66C2] transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-[#0A66C2]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                  </svg>
                  Audio
                </h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <span className="font-medium">Voice:</span>{' '}
                    {getVoiceName(wizardState.selectedVoiceId)}
                  </p>
                  <p>
                    <span className="font-medium">Music:</span>{' '}
                    {getMusicName(wizardState.selectedMusicId)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(3)}
                  className="text-[#0A66C2] hover:text-[#004182] font-medium text-sm"
                >
                  Edit Voice
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => onEdit(4)}
                  className="text-[#0A66C2] hover:text-[#004182] font-medium text-sm"
                >
                  Edit Music
                </button>
              </div>
            </div>
          </div>

          {/* Captions Section */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-[#0A66C2] transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-[#0A66C2]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                  Captions
                </h3>
                <p className="text-sm text-gray-700">
                  {wizardState.captionOptions.enabled
                    ? `Enabled • ${wizardState.captionOptions.style} style`
                    : 'Disabled'}
                </p>
              </div>
              <button
                onClick={() => onEdit(5)}
                className="text-[#0A66C2] hover:text-[#004182] font-medium text-sm"
              >
                Edit
              </button>
            </div>
          </div>

          {/* Images Section */}
          {wizardState.imageOverlays.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4 hover:border-[#0A66C2] transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-[#0A66C2]"
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
                    Images
                  </h3>
                  <p className="text-sm text-gray-700">
                    {wizardState.imageOverlays.length} image overlay
                    {wizardState.imageOverlays.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => onEdit(6)}
                  className="text-[#0A66C2] hover:text-[#004182] font-medium text-sm"
                >
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!isGenerating && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0A66C2] to-[#004182] rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Ready to Generate!</h3>
              <p className="text-sm text-gray-600">
                Click "Generate Video" below to create your professional video. This may take a
                few minutes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
