'use client';

import { CaptionOptions } from '@/types';
import CaptionCustomizer from '@/components/forms/CaptionCustomizer';

interface Step5CaptionsProps {
  captionOptions: CaptionOptions;
  captionText: string;
  onChange: (updates: { captionOptions?: CaptionOptions; captionText?: string }) => void;
}

export default function Step5Captions({
  captionOptions,
  captionText,
  onChange,
}: Step5CaptionsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customize Captions</h2>
        <p className="text-gray-600">
          Make your video accessible and engaging with customizable captions
        </p>
      </div>

      <CaptionCustomizer
        options={captionOptions}
        onChange={(newOptions) => onChange({ captionOptions: newOptions })}
        captionText={captionText}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-[#0A66C2] flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Caption Tips</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Captions increase engagement by 40%</li>
              <li>• Choose colors that contrast with your video</li>
              <li>• Bold styles work best for short-form content</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
