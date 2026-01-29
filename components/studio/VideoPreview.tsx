'use client';

import { VideoResult } from '@/types';
import { formatDuration } from '@/lib/utils';
import { Download, RefreshCw, Rocket, CheckCircle } from 'lucide-react';
import Button from '../forms/Button';
import Card from '../ui/Card';

interface VideoPreviewProps {
  video: VideoResult;
  onRegenerate: () => void;
  onLaunchCampaign: () => void;
}

export default function VideoPreview({ video, onRegenerate, onLaunchCampaign }: VideoPreviewProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = video.url;
    link.download = `video-${video.id}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="w-6 h-6 text-linkedin-success" />
        <h2 className="text-xl font-semibold text-linkedin-gray-900">
          Video Generated Successfully!
        </h2>
      </div>

      <div className="space-y-6">
        {/* Real Video Player */}
        <div className="relative bg-linkedin-gray-900 rounded-lg overflow-hidden">
          <video
            src={video.url}
            controls
            className="w-full"
            controlsList="nodownload"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Video Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-linkedin-gray-600 mb-1">Duration</p>
            <p className="text-sm font-semibold text-linkedin-gray-900">
              {formatDuration(video.duration)}
            </p>
          </div>
          <div>
            <p className="text-xs text-linkedin-gray-600 mb-1">Resolution</p>
            <p className="text-sm font-semibold text-linkedin-gray-900">
              {video.resolution}
            </p>
          </div>
          <div>
            <p className="text-xs text-linkedin-gray-600 mb-1">Captions</p>
            <p className="text-sm font-semibold text-linkedin-gray-900">
              {video.captionsIncluded ? 'Included' : 'None'}
            </p>
          </div>
          <div>
            <p className="text-xs text-linkedin-gray-600 mb-1">Video ID</p>
            <p className="text-sm font-semibold text-linkedin-gray-900 truncate">
              {video.id}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={onRegenerate}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-linkedin-gray-300 rounded-lg text-sm font-semibold text-linkedin-gray-700 hover:bg-linkedin-gray-50 hover:border-linkedin-gray-400 transition-all shadow-sm hover:shadow"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Regenerate</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-linkedin-gray-300 rounded-lg text-sm font-semibold text-linkedin-gray-700 hover:bg-linkedin-gray-50 hover:border-linkedin-gray-400 transition-all shadow-sm hover:shadow"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
          <button
            onClick={onLaunchCampaign}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-linkedin-blue rounded-lg text-sm font-semibold text-white hover:bg-linkedin-blue-dark transition-all shadow-sm hover:shadow-md"
          >
            <Rocket className="w-4 h-4" />
            <span>Launch Campaign</span>
          </button>
        </div>
      </div>
    </Card>
  );
}
