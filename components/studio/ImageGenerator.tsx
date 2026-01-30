'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/forms/Button';
import { Upload, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { TranscriptLine, ImageOverlay, ImageGenerationResponse } from '@/lib/types/image-overlay';

interface ImageGeneratorProps {
  transcriptLines: TranscriptLine[];
  jobId: string;
  onImagesGenerated: (overlays: ImageOverlay[]) => void;
  onSkip: () => void;
}

interface ImageSlot {
  id: string;
  transcriptLine: TranscriptLine;
  prompt: string;
  imageUrl: string | null;
  imagePath: string | null;
  isGenerating: boolean;
  error: string | null;
  selectedTimestamp: number;
  duration: number;
  isCustomUpload: boolean;
  showTiming: boolean;
}

export function ImageGenerator({
  transcriptLines,
  jobId,
  onImagesGenerated,
  onSkip,
}: ImageGeneratorProps) {
  // Select 2 evenly-spaced lines from transcript
  const selectedLines = selectEvenlySpacedLines(transcriptLines, 2);

  // Initialize image slots
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>(
    selectedLines.map((line, index) => ({
      id: `slot-${index}`,
      transcriptLine: line,
      prompt: '...',
      imageUrl: null,
      imagePath: null,
      isGenerating: false,
      error: null,
      selectedTimestamp: line.startTime,
      duration: 2,
      isCustomUpload: false,
      showTiming: true, // Auto-open
    }))
  );

  const [loadingPrompts, setLoadingPrompts] = useState(true);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Fetch AI-generated image prompts
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await fetch('/api/suggest-image-prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcriptLines: selectedLines }),
        });

        const data = await response.json();

        if (data.success && data.prompts) {
          setImageSlots((prev) =>
            prev.map((slot, index) => ({
              ...slot,
              prompt: data.prompts[index] || generateDefaultPrompt(slot.transcriptLine.text),
            }))
          );
        } else {
          setImageSlots((prev) =>
            prev.map((slot) => ({
              ...slot,
              prompt: generateDefaultPrompt(slot.transcriptLine.text),
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching image prompts:', error);
        setImageSlots((prev) =>
          prev.map((slot) => ({
            ...slot,
            prompt: generateDefaultPrompt(slot.transcriptLine.text),
          }))
        );
      } finally {
        setLoadingPrompts(false);
      }
    };

    fetchPrompts();
  }, []);

  const handlePromptChange = (index: number, prompt: string) => {
    setImageSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, prompt } : slot))
    );
  };

  const handleTimestampChange = (index: number, timestamp: number) => {
    // Find what's being said at this timestamp and update the prompt
    const textAtTimestamp = getTextAtTimestamp(transcriptLines, timestamp);
    const newPrompt = generateDefaultPrompt(textAtTimestamp);

    setImageSlots((prev) =>
      prev.map((slot, i) =>
        i === index
          ? { ...slot, selectedTimestamp: timestamp, prompt: newPrompt }
          : slot
      )
    );
  };

  const handleDurationChange = (index: number, duration: number) => {
    setImageSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, duration } : slot))
    );
  };

  const toggleTiming = (index: number) => {
    setImageSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, showTiming: !slot.showTiming } : slot))
    );
  };

  const addImageSlot = () => {
    // Find a good timestamp for the new slot (middle of remaining space)
    const lastSlot = imageSlots[imageSlots.length - 1];
    const maxTime = Math.max(29, Math.ceil(transcriptLines[transcriptLines.length - 1]?.endTime || 29));
    const newTimestamp = lastSlot ? Math.min(lastSlot.selectedTimestamp + 5, maxTime - 2) : 0;

    const textAtTimestamp = getTextAtTimestamp(transcriptLines, newTimestamp);
    const newPrompt = generateDefaultPrompt(textAtTimestamp);

    const newSlot: ImageSlot = {
      id: `slot-${Date.now()}`,
      transcriptLine: transcriptLines[0], // Placeholder
      prompt: newPrompt,
      imageUrl: null,
      imagePath: null,
      isGenerating: false,
      error: null,
      selectedTimestamp: newTimestamp,
      duration: 2,
      isCustomUpload: false,
      showTiming: true,
    };

    setImageSlots((prev) => [...prev, newSlot]);
  };

  const removeImageSlot = (index: number) => {
    if (imageSlots.length <= 1) return; // Keep at least 1 slot
    setImageSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerateImage = async (index: number) => {
    const slot = imageSlots[index];
    if (!slot.prompt.trim()) {
      return;
    }

    setImageSlots((prev) =>
      prev.map((s, i) =>
        i === index
          ? { ...s, isGenerating: true, error: null }
          : s
      )
    );

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: slot.prompt,
          jobId,
          imageIndex: index,
        }),
      });

      const data: ImageGenerationResponse = await response.json();

      if (!data.success || !data.imagePath || !data.imageUrl) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setImageSlots((prev) =>
        prev.map((s, i) =>
          i === index
            ? {
                ...s,
                imageUrl: data.imageUrl || null,
                imagePath: data.imagePath || null,
                isGenerating: false,
                error: null,
              }
            : s
        )
      );
    } catch (error) {
      console.error('Error generating image:', error);
      setImageSlots((prev) =>
        prev.map((s, i) =>
          i === index
            ? {
                ...s,
                isGenerating: false,
                error: error instanceof Error ? error.message : 'Failed to generate image',
              }
            : s
        )
      );
    }
  };

  const handleFileUpload = (index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    // For custom uploads, we'll use the local URL directly
    // In a real app, you'd upload to a server first
    setImageSlots((prev) =>
      prev.map((s, i) =>
        i === index
          ? {
              ...s,
              imageUrl,
              imagePath: imageUrl, // Using local URL for now
              isCustomUpload: true,
              error: null,
            }
          : s
      )
    );
  };

  const removeImage = (index: number) => {
    setImageSlots((prev) =>
      prev.map((s, i) =>
        i === index
          ? {
              ...s,
              imageUrl: null,
              imagePath: null,
              isCustomUpload: false,
              error: null,
            }
          : s
      )
    );
  };

  const handleContinue = () => {
    const overlays: ImageOverlay[] = imageSlots
      .filter((slot) => slot.imagePath && slot.imageUrl)
      .map((slot) => ({
        imagePath: slot.imagePath!,
        timestamp: slot.selectedTimestamp,
        duration: slot.duration,
      }));

    console.log('[ImageGenerator] Passing overlays to parent:', overlays);
    onImagesGenerated(overlays);
  };

  const someImagesGenerated = imageSlots.some((slot) => slot.imageUrl !== null);

  return (
    <div className="w-full">
      <style jsx global>{`
        .modern-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #e5e7eb;
          outline: none;
          margin: 0;
          padding: 0;
        }

        .modern-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #0A66C2;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          transition: all 0.2s ease;
          margin-top: -6px;
        }

        .modern-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #0A66C2;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          transition: all 0.2s ease;
        }

        .modern-slider:hover::-webkit-slider-thumb {
          transform: scale(1.2);
          box-shadow: 0 3px 10px rgba(10, 102, 194, 0.5);
        }

        .modern-slider:hover::-moz-range-thumb {
          transform: scale(1.2);
          box-shadow: 0 3px 10px rgba(10, 102, 194, 0.5);
        }

        .modern-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #e5e7eb;
        }

        .modern-slider::-moz-range-track {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #e5e7eb;
        }
      `}</style>

      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Add Images to Video</h2>
        <p className="text-sm text-gray-600 mt-1">
          Generate with AI or upload your own images
        </p>
      </div>

      {/* Vertical Stack Layout */}
      <div className="space-y-4 mb-6">
        {loadingPrompts ? (
          // Loading skeletons
          [0, 1].map((index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 animate-pulse flex gap-4">
              <div className="w-32 h-32 bg-gray-200 rounded flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-9 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))
        ) : (
          imageSlots.map((slot, index) => (
            <div
              key={slot.id}
              className="relative border border-gray-200 rounded-lg p-4 hover:border-[#0A66C2] transition-colors flex gap-4"
            >
              {/* Remove Slot Button */}
              {imageSlots.length > 1 && (
                <button
                  onClick={() => removeImageSlot(index)}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md z-10"
                  title="Remove image slot"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              {/* Image Preview Area - Left Side */}
              <div className="relative flex-shrink-0">
                {slot.imageUrl ? (
                  <div className="relative group">
                    <img
                      src={slot.imageUrl}
                      alt={`Image ${index + 1}`}
                      className="w-32 h-32 object-cover rounded border border-gray-200"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1.5 bg-gray-900 bg-opacity-75 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-opacity-100"
                      title="Clear image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRefs.current[slot.id]?.click()}
                    className="w-32 h-32 bg-gray-50 rounded flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#0A66C2] hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-gray-500 text-xs">Upload</span>
                  </button>
                )}
              </div>

              {/* Controls - Right Side */}
              <div className="flex-1 flex flex-col">
                {/* Prompt Input */}
                <input
                  type="text"
                  placeholder="Describe image..."
                  value={slot.prompt}
                  onChange={(e) => handlePromptChange(index, e.target.value)}
                  disabled={slot.isGenerating}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded mb-2 focus:outline-none focus:ring-1 focus:ring-[#0A66C2] disabled:opacity-50"
                />

                {/* Action Buttons */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => handleGenerateImage(index)}
                    disabled={slot.isGenerating || !slot.prompt.trim()}
                    className="flex-1 px-3 py-2 text-sm bg-[#0A66C2] text-white rounded hover:bg-[#004182] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {slot.isGenerating && (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    Generate
                  </button>
                  <input
                    ref={(el) => { fileInputRefs.current[slot.id] = el; }}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(index, file);
                    }}
                    className="hidden"
                  />
                </div>

                {/* Timing Controls (Always Visible) */}
                {slot.showTiming && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-600 w-12">Start:</span>
                      <input
                        type="range"
                        min="0"
                        max={Math.max(29, Math.ceil(transcriptLines[transcriptLines.length - 1]?.endTime || 29))}
                        step="0.1"
                        value={slot.selectedTimestamp}
                        onChange={(e) => handleTimestampChange(index, parseFloat(e.target.value))}
                        className="flex-1 modern-slider"
                      />
                      <span className="text-[#0A66C2] font-medium w-10 text-right">
                        {formatTimestamp(slot.selectedTimestamp)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-600 w-12">Length:</span>
                      <input
                        type="range"
                        min="0.5"
                        max="5"
                        step="0.5"
                        value={slot.duration}
                        onChange={(e) => handleDurationChange(index, parseFloat(e.target.value))}
                        className="flex-1 modern-slider"
                      />
                      <span className="text-[#0A66C2] font-medium w-10 text-right">
                        {slot.duration}s
                      </span>
                    </div>
                  </div>
                )}

                {/* Error */}
                {slot.error && (
                  <div className="text-xs text-red-600 mt-2">
                    {slot.error}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add More Images Button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={addImageSlot}
          className="flex items-center gap-2 px-4 py-2 text-sm border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#0A66C2] hover:text-[#0A66C2] hover:bg-blue-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Another Image
        </button>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button
          onClick={onSkip}
          className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
        >
          Skip Images
        </button>
        <button
          onClick={handleContinue}
          disabled={!someImagesGenerated}
          className="px-6 py-2 bg-[#0A66C2] text-white rounded-lg hover:bg-[#004182] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// Helper functions

function selectEvenlySpacedLines(
  lines: TranscriptLine[],
  count: number
): TranscriptLine[] {
  if (lines.length === 0) return [];
  if (lines.length <= count) return lines;

  const result: TranscriptLine[] = [];
  const step = lines.length / count;

  for (let i = 0; i < count; i++) {
    const index = Math.floor(i * step);
    result.push(lines[index]);
  }

  return result;
}

function generateDefaultPrompt(lineText: string): string {
  const cleanText = lineText.slice(0, 80);
  return cleanText;
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getTextAtTimestamp(lines: TranscriptLine[], timestamp: number): string {
  const line = lines.find((l) => timestamp >= l.startTime && timestamp <= l.endTime);
  return line ? line.text : 'Image';
}
