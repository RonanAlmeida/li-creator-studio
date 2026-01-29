'use client';

interface WizardNavigationProps {
  currentStep: number;
  canProceed: boolean;
  onBack: () => void;
  onNext: () => void;
  isGenerating?: boolean;
}

export default function WizardNavigation({
  currentStep,
  canProceed,
  onBack,
  onNext,
  isGenerating = false,
}: WizardNavigationProps) {
  const getNextButtonText = () => {
    if (currentStep === 7) return 'Generate Video';
    return 'Continue';
  };

  return (
    <div className="border-t border-gray-200 bg-white px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={currentStep === 1 || isGenerating}
          className={`
            px-6 py-2.5 rounded-lg font-medium transition-all
            ${
              currentStep === 1 || isGenerating
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95'
            }
          `}
        >
          <span className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </span>
        </button>

        <button
          onClick={onNext}
          disabled={!canProceed || isGenerating}
          className={`
            px-6 py-2.5 rounded-lg font-medium transition-all
            ${
              !canProceed || isGenerating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#0A66C2] to-[#004182] text-white hover:shadow-lg active:scale-95'
            }
          `}
        >
          <span className="flex items-center gap-2">
            {isGenerating ? (
              <>
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
              </>
            ) : (
              <>
                {getNextButtonText()}
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
