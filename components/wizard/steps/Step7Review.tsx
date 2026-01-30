'use client';

import { CaptionOptions, VideoResult } from '@/types';
import type { ImageOverlay, TranscriptLine } from '@/lib/types/image-overlay';

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
        <div className="space-y-4">
          {/* Progress Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-[#0A66C2] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 border-3 border-[#0A66C2] border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-7 h-7 bg-gradient-to-br from-[#0A66C2] to-[#004182] rounded-full" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Creating Your Video
                </h3>
                <p className="text-sm text-gray-600 font-medium">{loadingStage}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#0A66C2]">
                {loadingStage.includes('Step 1/3') ? '33%' :
                 loadingStage.includes('Step 2/3') ? '66%' :
                 loadingStage.includes('Step 3/3') ? '90%' : '10%'}
              </div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0A66C2] to-[#004182] transition-all duration-1000 ease-out"
              style={{
                width: loadingStage.includes('Step 1/3') ? '33%' :
                       loadingStage.includes('Step 2/3') ? '66%' :
                       loadingStage.includes('Step 3/3') ? '90%' : '10%'
              }}
            />
          </div>

          {/* LinkedIn Post Preview with Skeleton */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {/* Profile Header */}
            <div className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-linkedin-gray-200">
                  <img
                    src="https://i.pravatar.cc/150?img=12"
                    alt="Thor Odinson"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <h3 className="font-semibold text-gray-900">Thor Odinson</h3>
                    <svg className="w-4 h-4 text-[#0A66C2]" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M13.5 2h-11A.5.5 0 002 2.5v11a.5.5 0 00.5.5h11a.5.5 0 00.5-.5v-11a.5.5 0 00-.5-.5zM13 13H3V3h10v10zM5 6.5a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5zm0 2a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5zm0 2a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5z"/>
                    </svg>
                    <span className="text-sm text-gray-600">• 1st</span>
                  </div>
                  <p className="text-xs text-gray-600">Senior Product Manager at GSOBA</p>
                  <p className="text-xs text-gray-500">Just now</p>
                </div>
              </div>

              {/* Skeleton Content */}
              <div className="mb-3 space-y-2 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                <div className="flex gap-2 mt-2">
                  <div className="h-3 bg-blue-200 rounded w-24"></div>
                  <div className="h-3 bg-blue-200 rounded w-32"></div>
                  <div className="h-3 bg-blue-200 rounded w-28"></div>
                </div>
              </div>
            </div>

            {/* Video Skeleton */}
            <div className="relative bg-gray-900 mx-auto animate-pulse" style={{ maxWidth: '300px', height: '533px' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-700 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <p className="text-gray-600 text-sm font-medium">
                    {loadingStage.includes('Step 3/3') ? 'Almost ready...' : 'Processing...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="border-t border-gray-200 p-2">
              <div className="flex items-center justify-around animate-pulse">
                {['Like', 'Comment', 'Repost', 'Send'].map((action) => (
                  <div key={action} className="flex items-center gap-2 px-4 py-2">
                    <div className="w-5 h-5 bg-gray-200 rounded"></div>
                    <div className="h-3 w-12 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fun Fact */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-[#0A66C2] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Did you know?</h4>
                <p className="text-sm text-gray-700">
                  Videos with captions get 40% more views on LinkedIn. Your video will have professional, perfectly-timed captions!
                </p>
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
