'use client';

import { useState } from 'react';
import { TabId, VideoResult, ToastMessage, CaptionOptions } from '@/types';
import { generateId } from '@/lib/utils';
import { CAPTION_DEFAULTS, TEXT_LIMITS } from '@/lib/constants';
import { validateTextLength } from '@/lib/utils';
import { generateTextToVideo } from '@/lib/api';
import PostLibrary from '@/components/studio/PostLibrary';
import ScriptEditor from '@/components/studio/ScriptEditor';
import TextInput from '@/components/forms/TextInput';
import CaptionCustomizer from '@/components/forms/CaptionCustomizer';
import Button from '@/components/forms/Button';
import VideoPreview from '@/components/studio/VideoPreview';
import CampaignWizard from '@/components/studio/CampaignWizard';
import { ToastContainer } from '@/components/ui/Toast';
import { Video, Image, Type, Play, Sparkles, TrendingUp, BarChart3, Clock } from 'lucide-react';

type GenerationType = 'text-to-video' | 'image-to-video' | 'video-to-video';

export default function Home() {
  const [activeTab, setActiveTab] = useState<GenerationType>('text-to-video');
  const [text, setText] = useState('');
  const [captionOptions, setCaptionOptions] = useState<CaptionOptions>(CAPTION_DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [generatedVideo, setGeneratedVideo] = useState<VideoResult | null>(null);
  const [showCampaignWizard, setShowCampaignWizard] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [scriptText, setScriptText] = useState<string>('');

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const toast: ToastMessage = {
      id: generateId(),
      type,
      message,
      duration: 5000,
    };
    setToasts([...toasts, toast]);
  };

  const removeToast = (id: string) => {
    setToasts(toasts.filter(t => t.id !== id));
  };

  const handleImportPost = (content: string) => {
    setScriptText(content);
    addToast('success', 'Post sent to Script Writer!');
  };

  const handleScriptGenerated = (script: string) => {
    setText(script);
    setScriptText('');
    addToast('success', 'Script imported to video editor!');
  };

  const handleGenerate = async () => {
    const validation = validateTextLength(text, TEXT_LIMITS.min, TEXT_LIMITS.max);
    if (!validation.valid) {
      setError(validation.error);
      addToast('error', validation.error || 'Invalid text');
      return;
    }

    setError(undefined);
    setLoading(true);

    try {
      const video = await generateTextToVideo(text, captionOptions);
      setGeneratedVideo(video);
      addToast('success', 'Video generated successfully!');

      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    } catch (err) {
      const errorMsg = 'Failed to generate video. Please try again.';
      setError(errorMsg);
      addToast('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    setGeneratedVideo(null);
    addToast('info', 'Ready to generate a new video');
  };

  const handleLaunchCampaign = () => {
    setShowCampaignWizard(true);
  };

  const handleCampaignSuccess = () => {
    addToast('success', 'Campaign launched successfully!');
    setGeneratedVideo(null);
  };

  return (
    <div className="min-h-screen bg-linkedin-gray-100">
      {/* Main Container */}
      <div className="max-w-[1280px] mx-auto px-6 py-6 overflow-hidden">
        <div className="grid grid-cols-12 gap-5">
          {/* Left Sidebar - Profile & Posts */}
          <div className="col-span-3 space-y-4">
            <div className="bg-white rounded-xl shadow-linkedin overflow-hidden">
              {/* Header Image */}
              <div className="h-20 relative overflow-hidden">
                <img
                  src="/gsoba-banner.png"
                  alt="GSOBA"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Profile Picture */}
              <div className="px-4 pb-4 relative">
                <div className="w-16 h-16 -mt-8 rounded-full border-4 border-white shadow-lg relative z-10 overflow-hidden bg-linkedin-gray-200">
                  <img
                    src="https://i.pravatar.cc/150?img=12"
                    alt="Thor Odinson"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="mt-2 text-base font-semibold text-linkedin-gray-900">Thor Odinson</h3>
                <p className="text-xs text-linkedin-gray-600 mt-0.5">Senior Product Manager at GSOBA</p>
              </div>
              <div className="border-t border-linkedin-gray-200 px-4 py-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-linkedin-gray-600">Videos created</span>
                  <span className="font-semibold text-linkedin-gray-900">127</span>
                </div>
              </div>
            </div>

            <PostLibrary onImportPost={handleImportPost} />

            <div className="bg-white rounded-xl shadow-linkedin p-4">
              <h4 className="text-sm font-semibold text-linkedin-gray-900 mb-3">Quick Stats</h4>
              <div className="space-y-3">
                <StatItem icon={<TrendingUp className="w-4 h-4" />} label="Engagement" value="+12.5%" />
                <StatItem icon={<BarChart3 className="w-4 h-4" />} label="Reach" value="45.2K" />
                <StatItem icon={<Clock className="w-4 h-4" />} label="Avg. Watch" value="2:34" />
              </div>
            </div>
          </div>

          {/* Center Feed - Main Content */}
          <div className="col-span-5 space-y-4">
            {/* Post Creation Card */}
            <div id="video-content-area" className="bg-white rounded-xl shadow-linkedin p-5">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-linkedin-gray-900">Create Video Content</h2>
              </div>

              {/* Generation Type Tabs */}
              <div className="flex gap-2 mb-5 p-1 bg-linkedin-gray-100 rounded-lg">
                <TabButton
                  active={activeTab === 'text-to-video'}
                  onClick={() => setActiveTab('text-to-video')}
                  icon={<Type className="w-4 h-4" />}
                  label="Text to Video"
                />
                <TabButton
                  active={activeTab === 'image-to-video'}
                  onClick={() => setActiveTab('image-to-video')}
                  icon={<Image className="w-4 h-4" />}
                  label="Image to Video"
                />
                <TabButton
                  active={activeTab === 'video-to-video'}
                  onClick={() => setActiveTab('video-to-video')}
                  icon={<Play className="w-4 h-4" />}
                  label="Video to Video"
                />
              </div>

              {/* Content Area */}
              <div className="space-y-4">
                {activeTab === 'text-to-video' && (
                  <>
                    <TextInput
                      value={text}
                      onChange={setText}
                      placeholder="Share your thoughts, ideas, or story... (minimum 10 characters)"
                      rows={8}
                      error={error}
                    />

                    <CaptionCustomizer
                      options={captionOptions}
                      onChange={setCaptionOptions}
                    />

                    <Button
                      onClick={handleGenerate}
                      loading={loading}
                      disabled={text.length < TEXT_LIMITS.min}
                      className="w-full py-3 text-base font-semibold"
                    >
                      {loading ? 'Generating Video...' : 'Generate Video'}
                    </Button>
                  </>
                )}

                {activeTab === 'image-to-video' && (
                  <div>
                    {!selectedImage ? (
                      <label className="block text-center py-12 border-2 border-dashed border-slate-300 rounded-2xl hover:border-linkedin-blue hover:bg-linkedin-blue/5 transition-all cursor-pointer group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSelectedImage(file);
                              addToast('success', 'Image uploaded successfully!');
                            }
                          }}
                          className="hidden"
                        />
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-linkedin-blue/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Image className="w-8 h-8 text-linkedin-blue" />
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-1">Upload Image</h3>
                        <p className="text-sm text-slate-600 mb-4">Transform static images into dynamic video content</p>
                        <span className="inline-block px-5 py-2.5 bg-linkedin-blue text-white font-semibold rounded-xl shadow-sm hover:shadow-md hover:bg-linkedin-blue-dark transition-all">
                          Choose Image
                        </span>
                      </label>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                          <img
                            src={URL.createObjectURL(selectedImage)}
                            alt="Selected"
                            className="w-full h-64 object-cover"
                          />
                          <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-colors"
                          >
                            <Type className="w-4 h-4 text-slate-700" />
                          </button>
                        </div>

                        <TextInput
                          value={text}
                          onChange={setText}
                          placeholder="Add a description or prompt for your video... (optional)"
                          rows={4}
                          error={error}
                        />

                        <CaptionCustomizer
                          options={captionOptions}
                          onChange={setCaptionOptions}
                        />

                        <Button
                          onClick={handleGenerate}
                          loading={loading}
                          className="w-full py-3 text-base font-semibold"
                        >
                          {loading ? 'Generating Video...' : 'Generate Video from Image'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'video-to-video' && (
                  <div>
                    {!selectedVideo ? (
                      <label className="block text-center py-12 border-2 border-dashed border-slate-300 rounded-2xl hover:border-linkedin-blue hover:bg-linkedin-blue/5 transition-all cursor-pointer group">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSelectedVideo(file);
                              addToast('success', 'Video uploaded successfully!');
                            }
                          }}
                          className="hidden"
                        />
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-linkedin-blue/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 text-linkedin-blue" />
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-1">Upload Video</h3>
                        <p className="text-sm text-slate-600 mb-4">Enhance and transform existing video content</p>
                        <span className="inline-block px-5 py-2.5 bg-linkedin-blue text-white font-semibold rounded-xl shadow-sm hover:shadow-md hover:bg-linkedin-blue-dark transition-all">
                          Choose Video
                        </span>
                      </label>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
                          <video
                            src={URL.createObjectURL(selectedVideo)}
                            className="w-full h-64 object-cover"
                            controls
                          />
                          <button
                            onClick={() => setSelectedVideo(null)}
                            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-colors"
                          >
                            <Type className="w-4 h-4 text-slate-700" />
                          </button>
                        </div>

                        <TextInput
                          value={text}
                          onChange={setText}
                          placeholder="Add enhancement instructions... (optional)"
                          rows={4}
                          error={error}
                        />

                        <CaptionCustomizer
                          options={captionOptions}
                          onChange={setCaptionOptions}
                        />

                        <Button
                          onClick={handleGenerate}
                          loading={loading}
                          className="w-full py-3 text-base font-semibold"
                        >
                          {loading ? 'Generating Video...' : 'Generate Enhanced Video'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Generated Video Preview */}
            {generatedVideo && (
              <VideoPreview
                video={generatedVideo}
                onRegenerate={handleRegenerate}
                onLaunchCampaign={handleLaunchCampaign}
              />
            )}
          </div>

          {/* Right Sidebar - Script Writer */}
          <div className="col-span-4">
            <ScriptEditor onScriptGenerated={handleScriptGenerated} importedText={scriptText} />
          </div>
        </div>
      </div>

      {showCampaignWizard && generatedVideo && (
        <CampaignWizard
          isOpen={showCampaignWizard}
          onClose={() => setShowCampaignWizard(false)}
          videoData={generatedVideo}
          onSuccess={handleCampaignSuccess}
        />
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
        active
          ? 'bg-white text-linkedin-blue shadow-sm'
          : 'text-linkedin-gray-600 hover:text-linkedin-gray-900'
      }`}
    >
      {icon}
      <span className="hidden lg:inline">{label}</span>
    </button>
  );
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatItem({ icon, label, value }: StatItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="text-linkedin-gray-600">{icon}</div>
        <span className="text-xs text-linkedin-gray-600">{label}</span>
      </div>
      <span className="text-xs font-semibold text-linkedin-gray-900">{value}</span>
    </div>
  );
}
