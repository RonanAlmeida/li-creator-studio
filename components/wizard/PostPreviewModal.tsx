'use client';

import { X } from 'lucide-react';
import { VideoResult } from '@/types';

interface PostPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoResult;
  captionText: string;
  scriptText: string;
  hashtags: string;
}

export default function PostPreviewModal({
  isOpen,
  onClose,
  video,
  captionText,
  scriptText,
  hashtags,
}: PostPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">Post Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* LinkedIn Post Preview */}
        <div className="p-6">
          {/* Profile Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-linkedin-gray-200">
              <img
                src="https://i.pravatar.cc/150?img=12"
                alt="Thor Odinson"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <h3 className="font-semibold text-gray-900">Thor Odinson</h3>
                <svg className="w-4 h-4 text-[#0A66C2]" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.5 2h-11A.5.5 0 002 2.5v11a.5.5 0 00.5.5h11a.5.5 0 00.5-.5v-11a.5.5 0 00-.5-.5zM13 13H3V3h10v10zM5 6.5a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5zm0 2a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5zm0 2a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5z"/>
                </svg>
                <span className="text-sm text-gray-600">• 1st</span>
              </div>
              <p className="text-xs text-gray-600">Senior Product Manager at GSOBA</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span>Just now</span>
                <span>•</span>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 1a6 6 0 110 12A6 6 0 018 2zm3.5 6a.5.5 0 01-.5.5H8a.5.5 0 01-.5-.5V4.5a.5.5 0 011 0V7.5h2.5a.5.5 0 01.5.5z"/>
                </svg>
              </p>
            </div>
            <button className="text-gray-400 hover:bg-gray-100 p-1 rounded">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3 9.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
              </svg>
            </button>
          </div>

          {/* Post Content */}
          <div className="mb-3">
            {captionText && (
              <h4 className="font-semibold text-gray-900 mb-2">{captionText}</h4>
            )}
            <p className="text-sm text-gray-900 whitespace-pre-wrap mb-2">
              {scriptText}
              {scriptText.length > 200 && (
                <button className="text-[#0A66C2] font-semibold ml-1">...more</button>
              )}
            </p>
            {hashtags && (
              <p className="text-sm text-[#0A66C2] font-normal">
                {hashtags}
              </p>
            )}
          </div>

          {/* Video */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-3 mx-auto" style={{ maxWidth: '300px', maxHeight: '533px' }}>
            <video
              src={video.url}
              controls
              autoPlay
              muted
              loop
              playsInline
              className="w-full object-contain"
              style={{ maxHeight: '533px', aspectRatio: '9/16' }}
              preload="auto"
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 mt-3 pt-1">
            <div className="flex items-center justify-around py-1">
            {['Like', 'Comment', 'Repost', 'Send'].map((action) => (
              <button
                key={action}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                {action === 'Like' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                )}
                {action === 'Comment' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                )}
                {action === 'Repost' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                )}
                {action === 'Send' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
                <span>{action}</span>
              </button>
            ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // TODO: Implement actual posting to LinkedIn
              alert('Post to LinkedIn coming soon!');
            }}
            className="flex-1 px-4 py-2.5 bg-[#0A66C2] text-white rounded-lg text-sm font-semibold hover:bg-[#004182] transition-colors"
          >
            Post to LinkedIn
          </button>
        </div>
      </div>
    </div>
  );
}
