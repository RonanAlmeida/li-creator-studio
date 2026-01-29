'use client';

interface ProgressBarProps {
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
}

const STEPS = [
  { label: 'Script', icon: '📝' },
  { label: 'Hashtags', icon: '#️⃣' },
  { label: 'Voice', icon: '🎤' },
  { label: 'Music', icon: '🎵' },
  { label: 'Captions', icon: '💬' },
  { label: 'Images', icon: '🖼️' },
  { label: 'Review', icon: '👁️' },
  { label: 'Preview', icon: '▶️' },
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
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-blue-100 -z-10 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 transition-all duration-500 rounded-full shadow-sm"
              style={{
                width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
              }}
            />
          </div>

          {STEPS.map((stepData, index) => {
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
                    w-11 h-11 rounded-full flex items-center justify-center
                    font-semibold text-lg transition-all duration-300 transform
                    ${
                      status === 'completed'
                        ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg scale-100'
                        : status === 'active'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-xl scale-110 ring-4 ring-blue-200 animate-pulse'
                        : 'bg-white text-gray-400 border-2 border-gray-200'
                    }
                    ${clickable ? 'cursor-pointer hover:scale-110 hover:shadow-lg' : 'cursor-not-allowed'}
                  `}
                >
                  {status === 'completed' ? (
                    <span className="text-xl">✓</span>
                  ) : (
                    <span className="text-xl">{stepData.icon}</span>
                  )}
                </button>

                <span
                  className={`
                    mt-2 text-xs font-medium hidden md:block transition-colors duration-300
                    ${
                      status === 'active'
                        ? 'text-blue-700 font-semibold'
                        : status === 'completed'
                        ? 'text-blue-600'
                        : 'text-gray-400'
                    }
                  `}
                >
                  {stepData.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
