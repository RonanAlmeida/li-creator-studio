'use client';

import VoiceSelector from '@/components/forms/VoiceSelector';

interface Step3VoiceProps {
  selectedVoiceId: string;
  onVoiceChange: (voiceId: string) => void;
}

export default function Step3Voice({ selectedVoiceId, onVoiceChange }: Step3VoiceProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Voice</h2>
        <p className="text-gray-600">
          Select the perfect voice to narrate your video script
        </p>
      </div>

      <VoiceSelector selectedVoiceId={selectedVoiceId} onVoiceChange={onVoiceChange} />

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
            <h3 className="font-medium text-gray-900 mb-1">Voice Tips</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Click the play button to preview each voice</li>
              <li>• Choose a voice that matches your content tone</li>
              <li>• Professional voices work best for business content</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
