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
  return (
    <Card className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="w-6 h-6 text-linkedin-success" />
        <h2 className="text-xl font-semibold text-linkedin-gray-900">
          Video Generated Successfully!
        </h2>
      </div>

      <div className="space-y-6">
        {/* Video Player Placeholder */}
        <div className="relative bg-linkedin-gray-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
              <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
            </div>
            <p className="text-sm">Video Preview</p>
            <p className="text-xs text-white/70 mt-1">
              {formatDuration(video.duration)} • {video.resolution}
            </p>
          </div>
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
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" onClick={onRegenerate} className="flex-1">
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </Button>
          <Button variant="secondary" className="flex-1">
            <Download className="w-4 h-4" />
            Download Video
          </Button>
          <Button onClick={onLaunchCampaign} className="flex-1 sm:flex-[1.5]">
            <Rocket className="w-4 h-4" />
            Launch LinkedIn Campaign
          </Button>
        </div>
      </div>
    </Card>
  );
}
