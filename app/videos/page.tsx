'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Calendar, Clock } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: number;
  createdAt: string;
  transcript: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos/list');
      const data = await response.json();
      if (data.success) {
        setVideos(data.videos);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Video Library</h1>
              <p className="text-slate-600">Browse all generated videos</p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-linkedin-blue text-white rounded-lg hover:bg-linkedin-blue-dark transition-colors font-semibold"
            >
              Create New Video
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-slate-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          // Empty state
          <div className="text-center py-20">
            <div className="inline-block p-6 bg-white rounded-full shadow-lg mb-4">
              <Play className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No videos yet</h2>
            <p className="text-slate-600 mb-6">Create your first video to see it here</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-linkedin-blue text-white rounded-lg hover:bg-linkedin-blue-dark transition-colors font-semibold"
            >
              Create Video
            </Link>
          </div>
        ) : (
          // Video grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Video thumbnail */}
                <div className="relative aspect-[9/16] bg-slate-900 overflow-hidden">
                  <video
                    src={video.url}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    poster={video.thumbnail}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-8 h-8 text-linkedin-blue ml-1" fill="currentColor" />
                    </div>
                  </div>
                  {/* Duration badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-white text-xs font-semibold">
                    {formatDuration(video.duration)}
                  </div>
                </div>

                {/* Video info */}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-linkedin-blue transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {video.transcript}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(video.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDuration(video.duration)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex gap-2">
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-linkedin-blue text-white rounded-lg hover:bg-linkedin-blue-dark transition-colors text-sm font-semibold text-center"
                  >
                    Watch
                  </a>
                  <a
                    href={video.url}
                    download
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-semibold"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
