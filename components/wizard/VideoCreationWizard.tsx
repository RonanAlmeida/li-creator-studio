'use client';

import { useState, useEffect } from 'react';
import { CaptionOptions, VideoResult } from '@/types';
import type { ImageOverlay, TranscriptLine } from '@/lib/types/image-overlay';
import { generateId } from '@/lib/utils';
import { DEFAULT_VOICE } from '@/lib/constants/voices';
import ProgressBar from './ProgressBar';
import WizardNavigation from './WizardNavigation';
import Step1ScriptInput from './steps/Step1ScriptInput';
import Step2Hashtags from './steps/Step2Hashtags';
import Step3Voice from './steps/Step3Voice';
import Step4Music from './steps/Step4Music';
import Step5Captions from './steps/Step5Captions';
import Step6Images from './steps/Step6Images';
import Step7Review from './steps/Step7Review';
import Step8Preview from './steps/Step8Preview';

interface WizardState {
  currentStep: number;
  completedSteps: Set<number>;
  generationType: 'text-to-video' | 'image-to-video' | 'video-to-video';
  jobId: string; // Generated at start for image generation

  // Step 1
  scriptText: string;
  captionText: string;
  uploadedFile: File | null;

  // Step 2
  hashtags: string;

  // Step 3
  selectedVoiceId: string;

  // Step 4
  selectedMusicId: string;

  // Step 5
  captionOptions: CaptionOptions;

  // Step 6
  imageOverlays: ImageOverlay[];
  transcriptLines: TranscriptLine[];

  // Step 7-8
  isGenerating: boolean;
  loadingStage: string;
  generatedVideo: VideoResult | null;
}

interface VideoCreationWizardProps {
  generationType: 'text-to-video' | 'image-to-video' | 'video-to-video';
  onComplete: (video: VideoResult) => void;
  initialScript?: string;
  initialCaption?: string;
  initialHashtags?: string;
}

export default function VideoCreationWizard({
  generationType,
  onComplete,
  initialScript = '',
  initialCaption = '',
  initialHashtags = '',
}: VideoCreationWizardProps) {
  const [wizardState, setWizardState] = useState<WizardState>({
    currentStep: 1,
    completedSteps: new Set(),
    generationType,
    jobId: generateId(), // Generate jobId at start for image generation
    scriptText: initialScript,
    captionText: initialCaption,
    uploadedFile: null,
    hashtags: initialHashtags,
    selectedVoiceId: DEFAULT_VOICE.id,
    selectedMusicId: 'none',
    captionOptions: {
      enabled: true,
      style: 'default',
      fontFamily: 'Reddit Sans, sans-serif',
      position: 'bottom',
      color: '#FFFFFF',
      size: 24,
    },
    imageOverlays: [],
    transcriptLines: [],
    isGenerating: false,
    loadingStage: '',
    generatedVideo: null,
  });

  // Update wizard state when external props change (from AI Script Writer)
  useEffect(() => {
    if (initialScript || initialCaption || initialHashtags) {
      updateState({
        scriptText: initialScript,
        captionText: initialCaption,
        hashtags: initialHashtags,
      });
    }
  }, [initialScript, initialCaption, initialHashtags]);

  const updateState = (updates: Partial<WizardState>) => {
    setWizardState((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = (): boolean => {
    switch (wizardState.currentStep) {
      case 1:
        // Script must be at least 10 chars
        if (wizardState.scriptText.length < 10) return false;
        // File required for image/video types
        if (
          (wizardState.generationType === 'image-to-video' ||
            wizardState.generationType === 'video-to-video') &&
          !wizardState.uploadedFile
        ) {
          return false;
        }
        return true;
      case 2:
        return true; // Hashtags optional
      case 3:
        return !!wizardState.selectedVoiceId;
      case 4:
        return true; // Music optional (has "none")
      case 5:
        return true; // Captions always valid
      case 6:
        return true; // Images optional
      case 7:
        return !wizardState.isGenerating;
      case 8:
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (!canProceed()) return;

    const nextStep = wizardState.currentStep + 1;
    const newCompletedSteps = new Set(wizardState.completedSteps);
    newCompletedSteps.add(wizardState.currentStep);

    setWizardState((prev) => ({
      ...prev,
      currentStep: nextStep,
      completedSteps: newCompletedSteps,
    }));
  };

  const handlePreviousStep = () => {
    if (wizardState.currentStep > 1) {
      setWizardState((prev) => ({
        ...prev,
        currentStep: prev.currentStep - 1,
      }));
    }
  };

  const handleJumpToStep = (step: number) => {
    // Can only jump to completed steps or current step
    if (wizardState.completedSteps.has(step) || step === wizardState.currentStep) {
      setWizardState((prev) => ({
        ...prev,
        currentStep: step,
      }));
    }
  };

  const handleGenerate = async () => {
    updateState({ isGenerating: true, loadingStage: 'Generating audio...' });

    try {
      // Step 1: Generate audio and transcription
      const transcribeResponse = await fetch('/api/audio/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: wizardState.scriptText,
          voiceId: wizardState.selectedVoiceId,
        }),
      });

      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json();
        throw new Error(errorData.error || 'Transcription failed');
      }
      const transcribeData = await transcribeResponse.json();

      if (!transcribeData.success) {
        throw new Error(transcribeData.error || 'Transcription failed');
      }

      updateState({
        loadingStage: 'Creating video...',
        transcriptLines: transcribeData.transcriptLines || [],
      });

      // Step 2: Create video with overlays and captions
      const overlayResponse = await fetch('/api/video/overlay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioPath: transcribeData.audioPath,
          srtPath: transcribeData.srtPath,
          jobId: transcribeData.jobId,
          imageOverlays: wizardState.imageOverlays,
          captionOptions: wizardState.captionOptions,
          backgroundMusicId: wizardState.selectedMusicId,
        }),
      });

      if (!overlayResponse.ok) {
        const errorData = await overlayResponse.json();
        throw new Error(errorData.error || 'Video overlay failed');
      }
      const overlayData = await overlayResponse.json();

      if (!overlayData.success) {
        throw new Error(overlayData.error || 'Video overlay failed');
      }

      const videoResult: VideoResult = {
        id: transcribeData.jobId || '',
        url: `/videos/${transcribeData.jobId}.mp4`,
        thumbnail: '', // TODO: Generate thumbnail
        duration: transcribeData.duration || 0,
        resolution: '1080x1920',
        captionsIncluded: wizardState.captionOptions.enabled,
        captionOptions: wizardState.captionOptions,
        createdAt: new Date(),
      };

      updateState({
        isGenerating: false,
        generatedVideo: videoResult,
        currentStep: 8,
      });

      onComplete(videoResult);
    } catch (error) {
      console.error('Generation error:', error);
      updateState({
        isGenerating: false,
        loadingStage: '',
      });
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate video. Please try again.';
      alert(errorMessage);
    }
  };

  const renderStep = () => {
    switch (wizardState.currentStep) {
      case 1:
        return (
          <Step1ScriptInput
            generationType={wizardState.generationType}
            scriptText={wizardState.scriptText}
            captionText={wizardState.captionText}
            uploadedFile={wizardState.uploadedFile}
            onChange={(updates) => updateState(updates)}
          />
        );
      case 2:
        return (
          <Step2Hashtags
            hashtags={wizardState.hashtags}
            onChange={(hashtags) => updateState({ hashtags })}
          />
        );
      case 3:
        return (
          <Step3Voice
            selectedVoiceId={wizardState.selectedVoiceId}
            onVoiceChange={(voiceId) => updateState({ selectedVoiceId: voiceId })}
          />
        );
      case 4:
        return (
          <Step4Music
            selectedMusicId={wizardState.selectedMusicId}
            onMusicChange={(musicId) => updateState({ selectedMusicId: musicId })}
          />
        );
      case 5:
        return (
          <Step5Captions
            captionOptions={wizardState.captionOptions}
            captionText={wizardState.captionText}
            onChange={(updates) => updateState(updates)}
          />
        );
      case 6:
        return (
          <Step6Images
            transcriptLines={wizardState.transcriptLines}
            jobId={wizardState.jobId}
            scriptText={wizardState.scriptText}
            imageOverlays={wizardState.imageOverlays}
            onComplete={(overlays) => {
              updateState({ imageOverlays: overlays });
              handleNextStep();
            }}
            onSkip={handleNextStep}
          />
        );
      case 7:
        return (
          <Step7Review
            wizardState={wizardState}
            onEdit={handleJumpToStep}
            onGenerate={handleGenerate}
            isGenerating={wizardState.isGenerating}
            loadingStage={wizardState.loadingStage}
          />
        );
      case 8:
        return (
          <Step8Preview
            video={wizardState.generatedVideo}
            onRegenerate={() => updateState({ currentStep: 7 })}
            onDownload={() => {
              if (wizardState.generatedVideo) {
                window.open(wizardState.generatedVideo.url, '_blank');
              }
            }}
            onLaunchCampaign={() => {
              // TODO: Implement campaign launch
              alert('Campaign launch coming soon!');
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ProgressBar
        currentStep={wizardState.currentStep}
        completedSteps={wizardState.completedSteps}
        onStepClick={handleJumpToStep}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="wizard-step max-w-4xl mx-auto">{renderStep()}</div>
      </div>

      {wizardState.currentStep < 8 && (
        <WizardNavigation
          currentStep={wizardState.currentStep}
          canProceed={canProceed()}
          onBack={handlePreviousStep}
          onNext={wizardState.currentStep === 7 ? handleGenerate : handleNextStep}
          isGenerating={wizardState.isGenerating}
        />
      )}

      <style jsx>{`
        .wizard-step {
          animation: fadeSlide 0.3s ease-in-out;
        }

        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
