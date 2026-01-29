'use client';

interface ProgressBarProps {
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
}

const STEP_LABELS = [
  'Script',
  'Hashtags',
  'Voice',
  'Music',
  'Captions',
  'Images',
  'Review',
  'Preview',
];

export default function ProgressBar({
  currentStep,
  completedSteps,
  onStepClick,
}: ProgressBarProps) {
  const getStepStatus = (step: number) => {
    if (completedSteps.has(step)) return 'completed';
    if (step === currentStep) return 'active';
    return 'future';
  };

  const canClickStep = (step: number) => {
    return completedSteps.has(step) || step === currentStep;
  };

  return (
    <div className="bg-white border-b border-gray-200 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
            <div
              className="h-full bg-gradient-to-r from-[#0A66C2] to-[#004182] transition-all duration-500"
              style={{
                width: `${((currentStep - 1) / (STEP_LABELS.length - 1)) * 100}%`,
              }}
            />
          </div>

          {STEP_LABELS.map((label, index) => {
            const step = index + 1;
            const status = getStepStatus(step);
            const clickable = canClickStep(step);

            return (
              <div
                key={step}
                className="flex flex-col items-center relative"
                style={{ flex: 1 }}
              >
                <button
                  onClick={() => clickable && onStepClick(step)}
                  disabled={!clickable}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    font-semibold text-sm transition-all duration-300
                    ${
                      status === 'completed'
                        ? 'bg-gradient-to-r from-[#0A66C2] to-[#004182] text-white'
                        : status === 'active'
                        ? 'bg-[#0A66C2] text-white animate-pulse'
                        : 'bg-gray-200 text-gray-500'
                    }
                    ${clickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}
                  `}
                >
                  {status === 'completed' ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step
                  )}
                </button>

                <span
                  className={`
                    mt-2 text-xs font-medium hidden md:block
                    ${
                      status === 'active'
                        ? 'text-[#0A66C2]'
                        : status === 'completed'
                        ? 'text-gray-700'
                        : 'text-gray-400'
                    }
                  `}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
