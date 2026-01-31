'use client';

import { useState } from 'react';
import { Upload, ImagePlus, FileText, Sparkles, Check, Video, Download, Share2, ArrowRight, Mic, Music, Type } from 'lucide-react';
import { VideoResult, CaptionOptions } from '@/types';
import VoiceSelector from '@/components/forms/VoiceSelector';
import BackgroundMusicSelector from '@/components/forms/BackgroundMusicSelector';
import CaptionCustomizer from '@/components/forms/CaptionCustomizer';
import { DEFAULT_VOICE } from '@/lib/constants/voices';
import { CAPTION_DEFAULTS } from '@/lib/constants';

interface AdCreationWizardProps {
  onComplete: (video: VideoResult) => void;
}

interface AdFormData {
  caption: string;
  script: string;
  images: File[];
  voiceId: string;
  musicId: string;
  captionOptions: CaptionOptions;
}

export default function AdCreationWizard({ onComplete }: AdCreationWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<AdFormData>({
    caption: '',
    script: '',
    images: [],
    voiceId: DEFAULT_VOICE.id,
    musicId: 'none',
    captionOptions: CAPTION_DEFAULTS,
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<VideoResult | null>(null);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...previews]);
    setFormData({ ...formData, images: [...formData.images, ...files] });
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (files.length === 0) return;

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...previews]);
    setFormData({ ...formData, images: [...formData.images, ...files] });
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setImagePreviews(newPreviews);
  };

  const handleGenerateAd = async () => {
    setIsGenerating(true);
    setError('');

    try {
      // Create form data with all the ad content
      const apiFormData = new FormData();
      apiFormData.append('caption', formData.caption);
      apiFormData.append('script', formData.script);
      apiFormData.append('voiceId', formData.voiceId);
      apiFormData.append('musicId', formData.musicId);
      apiFormData.append('captionOptions', JSON.stringify(formData.captionOptions));

      // Add all images
      formData.images.forEach((image) => {
        apiFormData.append('images', image);
      });

      console.log('[Ad Gen] Calling API to generate ad video');

      // Call the ad generation API
      const response = await fetch('/api/video/generate-ad', {
        method: 'POST',
        body: apiFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate ad video');
      }

      const data = await response.json();
      console.log('[Ad Gen] API response:', data);

      setGeneratedVideo(data.video);
      setIsGenerating(false);
      onComplete(data.video);
    } catch (err) {
      console.error('[Ad Gen] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate ad video');
      setIsGenerating(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return formData.caption.trim().length > 0 && formData.script.trim().length > 0;
    if (step === 2) return formData.images.length > 0;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps - Centered */}
      <div className="flex items-center justify-center gap-8 relative">
        {[
          { num: 1, label: 'Content', icon: FileText },
          { num: 2, label: 'Images', icon: ImagePlus },
          { num: 3, label: 'Preview', icon: Video },
        ].map((s, idx) => (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  step >= s.num
                    ? 'bg-linkedin-blue text-white shadow-lg'
                    : 'bg-linkedin-gray-200 text-linkedin-gray-500'
                }`}
              >
                {step > s.num ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <s.icon className="w-5 h-5" />
                )}
              </div>
              <span className="text-xs font-medium text-linkedin-gray-700 mt-2">{s.label}</span>
            </div>
            {idx < 2 && (
              <div
                className={`h-1 w-24 mx-4 transition-all ${
                  step > s.num ? 'bg-linkedin-blue' : 'bg-linkedin-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-linkedin-gray-50 rounded-lg p-6 min-h-[400px]">
        {/* Step 1: Content (Caption + Script + Voice + Music) */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Caption */}
            <div>
              <label className="block text-sm font-semibold text-linkedin-gray-900 mb-2">
                Ad Caption
              </label>
              <p className="text-xs text-linkedin-gray-600 mb-3">
                Write a catchy headline for your ad (e.g., "Boost Your Productivity with GSOBA")
              </p>
              <input
                type="text"
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                placeholder="Enter your ad caption..."
                className="w-full px-4 py-3 border border-linkedin-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-blue text-sm"
                maxLength={100}
              />
              <p className="text-xs text-linkedin-gray-500 mt-2">
                {formData.caption.length}/100 characters
              </p>
            </div>

            {/* Script */}
            <div>
              <label className="block text-sm font-semibold text-linkedin-gray-900 mb-2">
                Ad Script
              </label>
              <p className="text-xs text-linkedin-gray-600 mb-3">
                Write the voiceover script for your ad (20-60 seconds recommended)
              </p>
              <textarea
                value={formData.script}
                onChange={(e) => setFormData({ ...formData, script: e.target.value })}
                placeholder="Enter your ad script..."
                rows={8}
                className="w-full px-4 py-3 border border-linkedin-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-blue text-sm resize-none"
              />
              <p className="text-xs text-linkedin-gray-500 mt-2">
                {formData.script.split(' ').filter(w => w).length} words ({Math.round(formData.script.split(' ').filter(w => w).length / 2.5)} seconds at normal speed)
              </p>
            </div>

            {/* Voice Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-linkedin-gray-900 mb-2">
                <Mic className="w-4 h-4" />
                Voice Selection
              </label>
              <VoiceSelector
                selectedVoiceId={formData.voiceId}
                onVoiceChange={(voiceId) => setFormData({ ...formData, voiceId })}
              />
            </div>

            {/* Background Music */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-linkedin-gray-900 mb-2">
                <Music className="w-4 h-4" />
                Background Music
              </label>
              <BackgroundMusicSelector
                selectedMusicId={formData.musicId}
                onMusicChange={(musicId) => setFormData({ ...formData, musicId })}
              />
            </div>

            {/* Caption Customization */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-linkedin-gray-900 mb-2">
                <Type className="w-4 h-4" />
                Caption Styling
              </label>
              <CaptionCustomizer
                options={formData.captionOptions}
                onChange={(captionOptions) => setFormData({ ...formData, captionOptions })}
              />
            </div>
          </div>
        )}

        {/* Step 2: Upload Images */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-linkedin-gray-900 mb-2">
                Upload Images
              </label>
              <p className="text-xs text-linkedin-gray-600 mb-3">
                Upload images that will be turned into your video ad (3-5 recommended)
              </p>

              {/* Upload Button with Drag & Drop */}
              <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                  isDragging
                    ? 'border-linkedin-blue bg-linkedin-blue/10 scale-105'
                    : 'border-linkedin-gray-300 hover:border-linkedin-blue hover:bg-linkedin-blue/5'
                }`}
              >
                <div className="flex flex-col items-center pointer-events-none">
                  <Upload className={`w-10 h-10 mb-2 transition-colors ${
                    isDragging ? 'text-linkedin-blue' : 'text-linkedin-gray-400'
                  }`} />
                  <p className={`text-sm font-semibold transition-colors ${
                    isDragging ? 'text-linkedin-blue' : 'text-linkedin-gray-700'
                  }`}>
                    {isDragging ? 'Drop images here' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="text-xs text-linkedin-gray-500 mt-1">PNG, JPG up to 10MB each</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-linkedin-gray-200"
                      />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Preview & Generate */}
        {step === 3 && (
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <p className="text-sm font-semibold text-red-800">Error: {error}</p>
              </div>
            )}
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-linkedin-blue border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-semibold text-linkedin-gray-900">Generating your ad video...</p>
                <p className="text-xs text-linkedin-gray-600 mt-2">Processing script, images, and overlays</p>
              </div>
            ) : generatedVideo ? (
              <div className="space-y-4">
                {/* LinkedIn Post Preview - GSOBA Company Ad */}
                <div className="bg-white border border-linkedin-gray-200 rounded-xl shadow-sm overflow-hidden">
                  {/* Profile Header */}
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-linkedin-gray-200">
                        <img
                          src="/gsoba-logo.png"
                          alt="GSOBA"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <h3 className="font-semibold text-gray-900">GSOBA</h3>
                          <span className="text-xs text-linkedin-gray-600">• Following</span>
                        </div>
                        <p className="text-xs text-linkedin-gray-600">Company • Technology</p>
                        <p className="text-xs text-linkedin-gray-500 flex items-center gap-1 mt-0.5">
                          <span>Promoted</span>
                        </p>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="mb-3">
                      <h4 className="font-semibold text-gray-900 mb-2">{formData.caption}</h4>
                    </div>
                  </div>

                  {/* Video */}
                  <div className="relative bg-gray-900">
                    <video
                      key={generatedVideo.url}
                      src={generatedVideo.url}
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full object-contain"
                      preload="auto"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-gray-200 p-2">
                    <div className="flex items-center justify-around">
                      {['Like', 'Comment', 'Repost', 'Send'].map((action) => (
                        <button
                          key={action}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                          <span>{action}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-linkedin-gray-300 rounded-lg text-sm font-semibold text-linkedin-gray-700 hover:bg-linkedin-gray-50 transition-all">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 bg-linkedin-blue text-white rounded-lg text-sm font-semibold hover:bg-linkedin-blue-dark transition-all">
                    <Share2 className="w-4 h-4" />
                    Launch Campaign
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-linkedin-gray-900 mb-3">Review Your Ad</h3>

                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-semibold text-linkedin-gray-700">Caption:</span>
                      <p className="text-linkedin-gray-900 mt-1">{formData.caption}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-linkedin-gray-700">Script:</span>
                      <p className="text-linkedin-gray-900 mt-1 whitespace-pre-wrap">{formData.script}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-linkedin-gray-700">Voice:</span>
                      <p className="text-linkedin-gray-900 mt-1">{formData.voiceId}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-linkedin-gray-700">Background Music:</span>
                      <p className="text-linkedin-gray-900 mt-1">{formData.musicId === 'none' ? 'No music' : formData.musicId}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-linkedin-gray-700">Images:</span>
                      <p className="text-linkedin-gray-900 mt-1">{formData.images.length} images uploaded</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGenerateAd}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-linkedin-blue to-linkedin-blue-dark text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Ad Video
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {step < 3 && (
        <div className="flex items-center justify-between pt-4 border-t border-linkedin-gray-200">
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className="px-4 py-2 text-sm font-semibold text-linkedin-gray-700 hover:bg-linkedin-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            onClick={() => {
              if (step === 2) {
                setStep(3);
              } else {
                setStep(step + 1);
              }
            }}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-6 py-2 bg-linkedin-blue text-white rounded-lg text-sm font-semibold hover:bg-linkedin-blue-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 2 ? 'Review Ad' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
