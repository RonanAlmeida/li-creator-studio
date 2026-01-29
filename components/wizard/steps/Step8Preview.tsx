'use client';

import { VideoResult } from '@/types';

interface Step8PreviewProps {
  video: VideoResult | null;
  onRegenerate: () => void;
  onDownload: () => void;
  onLaunchCampaign: () => void;
}

export default function Step8Preview({
  video,
  onRegenerate,
  onDownload,
  onLaunchCampaign,
}: Step8PreviewProps) {
  if (!video) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No video to preview</p>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-green-600"
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Video Generated Successfully!</h2>
          <p className="text-gray-600">Your video is ready to download or share</p>
        </div>
      </div>

      {/* Video Player */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow-lg">
        <video src={video.url} controls className="w-full">
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Video Metadata */}
      <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
        <div>
          <p className="text-xs text-gray-600 mb-1">Duration</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatDuration(video.duration)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Video ID</p>
          <p className="text-sm font-semibold text-gray-900 truncate">{video.id}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={onRegenerate}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Regenerate</span>
        </button>

        <button
          onClick={onDownload}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <span>Download</span>
        </button>

        <button
          onClick={onLaunchCampaign}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#0A66C2] to-[#004182] rounded-lg text-sm font-semibold text-white hover:shadow-lg transition-all"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span>Launch Campaign</span>
        </button>
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
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Next Steps</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Download your video for local use</li>
              <li>• Launch a campaign to share it on social media</li>
              <li>• Regenerate if you want to make any changes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
