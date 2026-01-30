'use client';

import { FileText, Hash, Mic, Music, MessageSquare, Image, Eye, Play } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
}

const STEPS = [
  { label: 'Script', Icon: FileText },
  { label: 'Hashtags', Icon: Hash },
  { label: 'Voice', Icon: Mic },
  { label: 'Music', Icon: Music },
  { label: 'Captions', Icon: MessageSquare },
  { label: 'Images', Icon: Image },
  { label: 'Review', Icon: Eye },
  { label: 'Preview', Icon: Play },
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
    <div className="bg-white border-b border-gray-200 py-3 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
            <div
              className="h-full bg-gradient-to-r from-[#0A66C2] to-[#004182] transition-all duration-500"
              style={{
                width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
              }}
            />
          </div>

          {STEPS.map((stepData, index) => {
            const step = index + 1;
            const status = getStepStatus(step);
            const clickable = canClickStep(step);
            const { Icon } = stepData;

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
                    transition-all duration-300
                    ${
                      status === 'completed'
                        ? 'bg-gradient-to-r from-[#0A66C2] to-[#004182] text-white'
                        : status === 'active'
                        ? 'bg-[#0A66C2] text-white'
                        : 'bg-gray-200 text-gray-500'
                    }
                    ${clickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}
                  `}
                >
                  <Icon className="w-5 h-5" />
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
