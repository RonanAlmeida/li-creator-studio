'use client';

import { useState } from 'react';
import { TabId, VideoResult, ToastMessage, CaptionOptions } from '@/types';
import { generateId } from '@/lib/utils';
import { CAPTION_DEFAULTS, TEXT_LIMITS } from '@/lib/constants';
import { validateTextLength } from '@/lib/utils';
import { generateTextToVideo, generateImageToVideo, overlayAudioAndCaptions, overlayExistingAudio, transcribeAudioWithTimestamps } from '@/lib/api';
import { DEFAULT_VOICE } from '@/lib/constants/voices';
import { BACKGROUND_MUSIC_TRACKS } from '@/lib/constants/background-music';
import PostLibrary from '@/components/studio/PostLibrary';
import ScriptEditor from '@/components/studio/ScriptEditor';
import { ImageGenerator } from '@/components/studio/ImageGenerator';
import TextInput from '@/components/forms/TextInput';
import CaptionCustomizer from '@/components/forms/CaptionCustomizer';
import VoiceSelector from '@/components/forms/VoiceSelector';
import BackgroundMusicSelector from '@/components/forms/BackgroundMusicSelector';
import Button from '@/components/forms/Button';
import VideoPreview from '@/components/studio/VideoPreview';
import CampaignWizard from '@/components/studio/CampaignWizard';
import { ToastContainer } from '@/components/ui/Toast';
import { Video, Image, Type, Play, Sparkles, TrendingUp, BarChart3, Clock, FileText, ImagePlus, Clapperboard, Settings, ChevronDown } from 'lucide-react';
import type { ImageOverlay, TranscriptLine } from '@/lib/types/image-overlay';

type GenerationType = 'text-to-video' | 'image-to-video' | 'video-to-video';

export default function Home() {
  const [activeTab, setActiveTab] = useState<GenerationType>('text-to-video');
  const [text, setText] = useState('');
  const [captionOptions, setCaptionOptions] = useState<CaptionOptions>(CAPTION_DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [error, setError] = useState<string>();
  const [generatedVideo, setGeneratedVideo] = useState<VideoResult | null>(null);
  const [showCampaignWizard, setShowCampaignWizard] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [scriptText, setScriptText] = useState<string>('');
  const [showScriptWriter, setShowScriptWriter] = useState(true);
  const [importedPost, setImportedPost] = useState<any>(null);
  const [captionText, setCaptionText] = useState<string>('');
  const [hashtags, setHashtags] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [lastImportedPostImage, setLastImportedPostImage] = useState<string | null>(null);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(DEFAULT_VOICE.id);
  const [selectedMusicId, setSelectedMusicId] = useState<string>('none');
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>([]);
  const [imageOverlays, setImageOverlays] = useState<ImageOverlay[]>([]);
  const [currentJobId, setCurrentJobId] = useState<string>('');

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

  const handleImportPost = (post: any) => {
    setImportedPost(post);
    setScriptText(''); // Clear any previous text

    // Store the image URL if the post has one
    if (post.image) {
      setLastImportedPostImage(post.image);
    } else {
      setLastImportedPostImage(null);
    }

    addToast('success', 'Post sent to Script Writer!');

    // Clear the imported post after a short delay to allow the ScriptEditor to process it
    setTimeout(() => {
      setImportedPost(null);
    }, 500);
  };

  const estimateLineTimings = (script: string): TranscriptLine[] => {
    // Split script into sentences
    const sentences = script.split(/[.!?]+/).filter(s => s.trim().length > 0);

    // Estimate ~150 words per minute speaking rate = 2.5 words per second
    const wordsPerSecond = 2.5;
    let currentTime = 0;
    const lines: TranscriptLine[] = [];

    sentences.forEach((sentence) => {
      const text = sentence.trim();
      if (text.length === 0) return;

      const wordCount = text.split(/\s+/).length;
      const duration = wordCount / wordsPerSecond;

      lines.push({
        text,
        startTime: currentTime,
        endTime: currentTime + duration,
      });

      currentTime += duration;
    });

    return lines;
  };

  const handleScriptGenerated = (script: string) => {
    console.log('Received script:', script);

    // Parse the script to extract title, body, and hashtags
    const lines = script.split('\n').map(line => line.trim()).filter(line => line !== '');
    let title = '';
    let cleanedScript = '';
    let extractedHashtags = '';

    // Extract title (first line if it exists)
    if (lines.length > 0) {
      title = lines[0];
    }

    // Find and extract ALL hashtags from the entire script using regex
    const hashtagPattern = /#[\w]+/g;
    const foundHashtags = script.match(hashtagPattern);
    if (foundHashtags && foundHashtags.length > 0) {
      extractedHashtags = foundHashtags.join(' ');
      console.log('Found hashtags:', extractedHashtags);
    }

    // Clean up the script body (everything after title, excluding hashtag-only lines)
    const scriptLines = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Skip lines that are purely hashtags (start with # or only contain hashtags and spaces)
      if (line.startsWith('#') || /^[#\s]+$/.test(line)) {
        continue;
      }
      scriptLines.push(line);
    }
    cleanedScript = scriptLines.join('\n');

    console.log('Parsed - Title:', title);
    console.log('Parsed - Script:', cleanedScript);
    console.log('Parsed - Hashtags:', extractedHashtags);

    // Set the cleaned script
    setText(cleanedScript);

    // Set the title as caption
    setCaptionText(title);

    // Set the hashtags
    setHashtags(extractedHashtags);

    // Generate transcript lines with timing estimates
    const estimatedLines = estimateLineTimings(cleanedScript);
    setTranscriptLines(estimatedLines);

    // Generate a unique job ID for this session
    setCurrentJobId(generateId());

    // Check if the original post had an image
    if (lastImportedPostImage) {
      // Switch to image-to-video tab
      setActiveTab('image-to-video');

      // Load the image from the URL
      fetch(lastImportedPostImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'imported-image.jpg', { type: 'image/jpeg' });
          setSelectedImage(file);
          addToast('success', 'Script with image imported! Add images to your video.');
        })
        .catch(err => {
          console.error('Error loading image:', err);
          addToast('success', 'Script imported! Add images to your video.');
        });

      // Clear the stored image URL
      setLastImportedPostImage(null);
    } else {
      // No image, stay on text-to-video
      addToast('success', 'Script imported! Add images to your video.');
    }

    setScriptText('');
  };

  const handleGenerate = async () => {
    const validation = validateTextLength(text, TEXT_LIMITS.min, TEXT_LIMITS.max);
    if (!validation.valid) {
      setError(validation.error);
      addToast('error', validation.error || 'Invalid text');
      return;
    }

    // For image-to-video, validate that an image is selected
    if (activeTab === 'image-to-video' && !selectedImage) {
      setError('Please select an image');
      addToast('error', 'Please select an image to generate video');
      return;
    }

    // Step 1: Generate audio and get real transcript with Whisper
    setError(undefined);
    setLoading(true);
    setLoadingStage('Generating audio and transcribing...');

    try {
      const transcriptData = await transcribeAudioWithTimestamps(text, selectedVoiceId);

      console.log('Transcription complete:', transcriptData);

      // Step 2: Show image generator with real transcript timings
      setTranscriptLines(transcriptData.transcriptLines);
      setCurrentJobId(transcriptData.jobId);
      setLoading(false);
      setShowImageGenerator(true);
    } catch (error) {
      console.error('Error during transcription:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate audio');
      addToast('error', error instanceof Error ? error.message : 'Failed to generate audio');
      setLoading(false);
    }
  };

  const handleStartVideoGeneration = async (overlaysToUse?: ImageOverlay[]) => {
    setError(undefined);
    setLoading(true);

    try {
      // We already have audio and transcript from the transcribe step
      // Just overlay everything now
      setLoadingStage('Overlaying audio, captions, and images on video...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for UI update

      // Get background music filename if selected
      const backgroundMusicFilename = selectedMusicId !== 'none' ?
        BACKGROUND_MUSIC_TRACKS.find(m => m.id === selectedMusicId)?.filename : undefined;

      // Use passed overlays or fall back to state
      const finalOverlays = overlaysToUse !== undefined ? overlaysToUse : imageOverlays;

      console.log('[Page] Overlaying with jobId:', currentJobId);
      console.log('[Page] Image overlays:', finalOverlays);

      // Call overlay-existing API since we already have audio and transcript
      const video = await overlayExistingAudio(
        currentJobId,
        captionOptions,
        backgroundMusicFilename,
        finalOverlays.length > 0 ? finalOverlays : undefined
      );

      setGeneratedVideo(video);
      addToast('success', 'Video generated successfully!');

      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate video. Please try again.';
      setError(errorMsg);
      addToast('error', errorMsg);
    } finally {
      setLoading(false);
      setLoadingStage('');
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
                  <span className="text-linkedin-gray-600">Posts</span>
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
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Create Video Content</h2>
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-linkedin-gray-700 hover:text-linkedin-blue hover:bg-linkedin-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              {/* Generation Type Tabs */}
              <div className="flex gap-6 mb-5 border-b border-linkedin-gray-200">
                <TabButton
                  active={activeTab === 'text-to-video'}
                  onClick={() => setActiveTab('text-to-video')}
                  icon={<FileText className="w-4 h-4" />}
                  label="Text to Video"
                />
                <TabButton
                  active={activeTab === 'image-to-video'}
                  onClick={() => setActiveTab('image-to-video')}
                  icon={<ImagePlus className="w-4 h-4" />}
                  label="Image to Video"
                />
                <TabButton
                  active={activeTab === 'video-to-video'}
                  onClick={() => setActiveTab('video-to-video')}
                  icon={<Clapperboard className="w-4 h-4" />}
                  label="Video to Video"
                />
              </div>

              {/* Content Area */}
              <div className="space-y-4">
                {activeTab === 'text-to-video' && (
                  <>
                    {/* Caption Text Input - MOVED TO TOP */}
                    <div>
                      <label className="block text-sm font-semibold text-linkedin-gray-700 mb-2">
                        Video title
                      </label>
                      <input
                        type="text"
                        value={captionText}
                        onChange={(e) => setCaptionText(e.target.value)}
                        placeholder="Enter your video caption (e.g., video title)"
                        className="w-full px-4 py-2.5 text-sm border border-linkedin-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-blue/40 focus:border-linkedin-blue bg-white shadow-sm transition-all"
                      />
                      <p className="mt-1 text-xs text-linkedin-gray-500">
                      
                      </p>
                    </div>

                    <TextInput
                      value={text}
                      onChange={setText}
                      placeholder="Describe what you want your video to convey... Your story, insight, or idea that connects with your professional audience"
                      rows={12}
                      error={error}
                    />

                    {/* Voice Selector */}
                    <VoiceSelector
                      selectedVoiceId={selectedVoiceId}
                      onVoiceChange={setSelectedVoiceId}
                    />

                    {/* Background Music Selector */}
                    <BackgroundMusicSelector
                      selectedMusicId={selectedMusicId}
                      onMusicChange={setSelectedMusicId}
                    />

                    {/* Hashtags Input */}
                    <div>
                      <label className="block text-sm font-semibold text-linkedin-gray-700 mb-2">
                        Hashtags
                      </label>
                      <input
                        type="text"
                        value={hashtags}
                        onChange={(e) => setHashtags(e.target.value)}
                        placeholder="Enter hashtags (e.g., #ProductManagement #AI #TechLeadership)"
                        className="w-full px-4 py-2.5 text-sm border border-linkedin-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-blue/40 focus:border-linkedin-blue bg-white shadow-sm transition-all"
                      />
                      <p className="mt-1 text-xs text-linkedin-gray-500">
                        Separate hashtags with spaces
                      </p>
                    </div>

                    <CaptionCustomizer
                      options={captionOptions}
                      onChange={setCaptionOptions}
                      captionText={captionText}
                    />

                    <Button
                      onClick={handleGenerate}
                      loading={loading}
                      disabled={text.length < TEXT_LIMITS.min}
                      className="w-full py-3 text-base font-semibold"
                    >
                      {loading ? (loadingStage || 'Generating Video...') : 'Generate Video'}
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

                        {/* Video Title */}
                        <div>
                          <label className="block text-sm font-semibold text-linkedin-gray-700 mb-2">
                            Video title
                          </label>
                          <input
                            type="text"
                            value={captionText}
                            onChange={(e) => setCaptionText(e.target.value)}
                            placeholder="Enter your video caption (e.g., video title)"
                            className="w-full px-4 py-2.5 text-sm border border-linkedin-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-blue/40 focus:border-linkedin-blue bg-white shadow-sm transition-all"
                          />
                        </div>

                        {/* Video Script */}
                        <TextInput
                          value={text}
                          onChange={setText}
                          placeholder="Describe what you want your video to convey... Your story, insight, or idea that connects with your professional audience"
                          rows={12}
                          error={error}
                        />

                        {/* Voice Selector */}
                        <VoiceSelector
                          selectedVoiceId={selectedVoiceId}
                          onVoiceChange={setSelectedVoiceId}
                        />

                        {/* Background Music Selector */}
                        <BackgroundMusicSelector
                          selectedMusicId={selectedMusicId}
                          onMusicChange={setSelectedMusicId}
                        />

                        {/* Hashtags */}
                        <div>
                          <label className="block text-sm font-semibold text-linkedin-gray-700 mb-2">
                            Hashtags
                          </label>
                          <input
                            type="text"
                            value={hashtags}
                            onChange={(e) => setHashtags(e.target.value)}
                            placeholder="Enter hashtags (e.g., #ProductManagement #AI #TechLeadership)"
                            className="w-full px-4 py-2.5 text-sm border border-linkedin-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-blue/40 focus:border-linkedin-blue bg-white shadow-sm transition-all"
                          />
                          <p className="mt-1 text-xs text-linkedin-gray-500">
                            Separate hashtags with spaces
                          </p>
                        </div>

                        <CaptionCustomizer
                          options={captionOptions}
                          onChange={setCaptionOptions}
                          captionText={captionText}
                        />

                        {/* Image Overlays Info */}
                        {imageOverlays.length > 0 && (
                          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                            <Sparkles className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-700">
                              {imageOverlays.length} image{imageOverlays.length > 1 ? 's' : ''} ready to add to video
                            </span>
                            <button
                              onClick={() => {
                                const lines = estimateLineTimings(text);
                                setTranscriptLines(lines);
                                setCurrentJobId(generateId());
                                setShowImageGenerator(true);
                              }}
                              className="ml-auto text-sm text-green-700 hover:text-green-800 underline"
                            >
                              Edit
                            </button>
                          </div>
                        )}

                        <div className="flex gap-3">
                          {imageOverlays.length === 0 && text.length >= TEXT_LIMITS.min && (
                            <button
                              onClick={() => {
                                const lines = estimateLineTimings(text);
                                setTranscriptLines(lines);
                                setCurrentJobId(generateId());
                                setShowImageGenerator(true);
                              }}
                              className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-linkedin-blue border-2 border-linkedin-blue rounded-lg hover:bg-linkedin-blue/5 transition-colors"
                            >
                              <Sparkles className="w-4 h-4" />
                              Add Images
                            </button>
                          )}

                          <Button
                            onClick={handleGenerate}
                            loading={loading}
                            disabled={text.length < TEXT_LIMITS.min}
                            className="flex-1 py-3 text-base font-semibold"
                          >
                            {loading ? (loadingStage || 'Generating Video...') : 'Generate Video'}
                          </Button>
                        </div>
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

                        {/* Video Title */}
                        <div>
                          <label className="block text-sm font-semibold text-linkedin-gray-700 mb-2">
                            Video title
                          </label>
                          <input
                            type="text"
                            value={captionText}
                            onChange={(e) => setCaptionText(e.target.value)}
                            placeholder="Enter your video caption (e.g., video title)"
                            className="w-full px-4 py-2.5 text-sm border border-linkedin-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-blue/40 focus:border-linkedin-blue bg-white shadow-sm transition-all"
                          />
                        </div>

                        {/* Video Script */}
                        <TextInput
                          value={text}
                          onChange={setText}
                          placeholder="Describe what you want your video to convey... Your story, insight, or idea that connects with your professional audience"
                          rows={12}
                          error={error}
                        />

                        {/* Voice Selector */}
                        <VoiceSelector
                          selectedVoiceId={selectedVoiceId}
                          onVoiceChange={setSelectedVoiceId}
                        />

                        {/* Background Music Selector */}
                        <BackgroundMusicSelector
                          selectedMusicId={selectedMusicId}
                          onMusicChange={setSelectedMusicId}
                        />

                        {/* Hashtags */}
                        <div>
                          <label className="block text-sm font-semibold text-linkedin-gray-700 mb-2">
                            Hashtags
                          </label>
                          <input
                            type="text"
                            value={hashtags}
                            onChange={(e) => setHashtags(e.target.value)}
                            placeholder="Enter hashtags (e.g., #ProductManagement #AI #TechLeadership)"
                            className="w-full px-4 py-2.5 text-sm border border-linkedin-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-blue/40 focus:border-linkedin-blue bg-white shadow-sm transition-all"
                          />
                          <p className="mt-1 text-xs text-linkedin-gray-500">
                            Separate hashtags with spaces
                          </p>
                        </div>

                        <CaptionCustomizer
                          options={captionOptions}
                          onChange={setCaptionOptions}
                          captionText={captionText}
                        />

                        {/* Image Overlays Info */}
                        {imageOverlays.length > 0 && (
                          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                            <Sparkles className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-700">
                              {imageOverlays.length} image{imageOverlays.length > 1 ? 's' : ''} ready to add to video
                            </span>
                            <button
                              onClick={() => {
                                const lines = estimateLineTimings(text);
                                setTranscriptLines(lines);
                                setCurrentJobId(generateId());
                                setShowImageGenerator(true);
                              }}
                              className="ml-auto text-sm text-green-700 hover:text-green-800 underline"
                            >
                              Edit
                            </button>
                          </div>
                        )}

                        <div className="flex gap-3">
                          {imageOverlays.length === 0 && text.length >= TEXT_LIMITS.min && (
                            <button
                              onClick={() => {
                                const lines = estimateLineTimings(text);
                                setTranscriptLines(lines);
                                setCurrentJobId(generateId());
                                setShowImageGenerator(true);
                              }}
                              className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-linkedin-blue border-2 border-linkedin-blue rounded-lg hover:bg-linkedin-blue/5 transition-colors"
                            >
                              <Sparkles className="w-4 h-4" />
                              Add Images
                            </button>
                          )}

                          <Button
                            onClick={handleGenerate}
                            loading={loading}
                            disabled={text.length < TEXT_LIMITS.min}
                            className="flex-1 py-3 text-base font-semibold"
                          >
                            {loading ? (loadingStage || 'Generating Video...') : 'Generate Video'}
                          </Button>
                        </div>
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

          {/* Right Sidebar - Script Writer Toggle */}
          <div className="col-span-4">
            {/* Toggle Header */}
            <div className="bg-white rounded-xl shadow-linkedin p-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-linkedin-blue" />
                <h3 className="text-sm font-semibold text-linkedin-gray-900">Script Writer</h3>
              </div>
              <button
                onClick={() => setShowScriptWriter(!showScriptWriter)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-linkedin-blue hover:bg-linkedin-blue/10 transition-colors"
              >
                <span>{showScriptWriter ? 'Collapse' : 'Expand'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showScriptWriter ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            {showScriptWriter && (
              <ScriptEditor
                onScriptGenerated={handleScriptGenerated}
                importedText={scriptText}
                importedPost={importedPost}
              />
            )}
          </div>
        </div>
      </div>

      {showImageGenerator && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center animate-fade-in overflow-y-auto">
          <div className="my-8">
            <ImageGenerator
              transcriptLines={transcriptLines}
              jobId={currentJobId}
              onImagesGenerated={(overlays) => {
                setImageOverlays(overlays);
                setShowImageGenerator(false);
                addToast('success', `Generating video with ${overlays.length} image(s)...`);
                handleStartVideoGeneration(overlays);
              }}
              onSkip={() => {
                setImageOverlays([]);
                setShowImageGenerator(false);
                addToast('info', 'Generating video without images...');
                handleStartVideoGeneration([]);
              }}
            />
          </div>
        </div>
      )}

      {showCampaignWizard && generatedVideo && (
        <CampaignWizard
          isOpen={showCampaignWizard}
          onClose={() => setShowCampaignWizard(false)}
          videoData={generatedVideo}
          onSuccess={handleCampaignSuccess}
        />
      )}

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

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
      className={`relative flex items-center gap-2 px-1 pb-3 text-sm font-semibold transition-colors ${
        active
          ? 'text-linkedin-gray-900'
          : 'text-linkedin-gray-600 hover:text-linkedin-gray-900'
      }`}
    >
      {icon}
      <span>{label}</span>
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linkedin-blue rounded-full" />
      )}
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

interface SettingsModalProps {
  onClose: () => void;
}

function SettingsModal({ onClose }: SettingsModalProps) {
  const [apiKeys, setApiKeys] = useState({
    textToVideo: '',
    imageToVideo: '',
    videoToVideo: '',
    captions: '',
    audio: '',
    openai: '',
    anthropic: '',
  });

  const handleSave = () => {
    localStorage.setItem('creator-studio-api-keys', JSON.stringify(apiKeys));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linkedin-blue px-6 py-5 border-b border-linkedin-gray-200">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-sm text-white/90 mt-1">Configure your API keys and environment variables</p>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Video Generation APIs */}
            <div>
              <h3 className="text-base font-bold text-linkedin-gray-900 mb-4 pb-2 border-b border-linkedin-gray-200">
                Video Generation APIs
              </h3>
              <div className="space-y-4">
                <ApiKeyInput
                  label="Text to Video API Key"
                  placeholder="sk-..."
                  value={apiKeys.textToVideo}
                  onChange={(val) => setApiKeys({ ...apiKeys, textToVideo: val })}
                  description="API key for text-to-video generation service"
                />
                <ApiKeyInput
                  label="Image to Video API Key"
                  placeholder="sk-..."
                  value={apiKeys.imageToVideo}
                  onChange={(val) => setApiKeys({ ...apiKeys, imageToVideo: val })}
                  description="API key for image-to-video conversion"
                />
                <ApiKeyInput
                  label="Video to Video API Key"
                  placeholder="sk-..."
                  value={apiKeys.videoToVideo}
                  onChange={(val) => setApiKeys({ ...apiKeys, videoToVideo: val })}
                  description="API key for video transformation"
                />
              </div>
            </div>

            {/* Media Processing APIs */}
            <div>
              <h3 className="text-base font-bold text-linkedin-gray-900 mb-4 pb-2 border-b border-linkedin-gray-200">
                Media Processing APIs
              </h3>
              <div className="space-y-4">
                <ApiKeyInput
                  label="Captions API Key"
                  placeholder="sk-..."
                  value={apiKeys.captions}
                  onChange={(val) => setApiKeys({ ...apiKeys, captions: val })}
                  description="API key for caption generation and styling"
                />
                <ApiKeyInput
                  label="Audio API Key"
                  placeholder="sk-..."
                  value={apiKeys.audio}
                  onChange={(val) => setApiKeys({ ...apiKeys, audio: val })}
                  description="API key for audio processing and generation"
                />
              </div>
            </div>

            {/* AI Services */}
            <div>
              <h3 className="text-base font-bold text-linkedin-gray-900 mb-4 pb-2 border-b border-linkedin-gray-200">
                AI Services
              </h3>
              <div className="space-y-4">
                <ApiKeyInput
                  label="OpenAI API Key"
                  placeholder="sk-..."
                  value={apiKeys.openai}
                  onChange={(val) => setApiKeys({ ...apiKeys, openai: val })}
                  description="For GPT-powered script generation"
                />
                <ApiKeyInput
                  label="Anthropic API Key"
                  placeholder="sk-ant-..."
                  value={apiKeys.anthropic}
                  onChange={(val) => setApiKeys({ ...apiKeys, anthropic: val })}
                  description="For Claude-powered content assistance"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-linkedin-gray-100 flex justify-between items-center">
          <p className="text-xs text-linkedin-gray-600">
            API keys are stored locally in your browser
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-linkedin-gray-700 hover:bg-linkedin-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="linkedin-button-primary text-sm"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ApiKeyInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

function ApiKeyInput({ label, placeholder, value, onChange, description }: ApiKeyInputProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-linkedin-gray-900 mb-1">
        {label}
      </label>
      {description && (
        <p className="text-xs text-linkedin-gray-600 mb-2">{description}</p>
      )}
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-linkedin-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-blue focus:border-transparent transition-all text-sm"
      />
    </div>
  );
}
