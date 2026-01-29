'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/forms/Button';
import Card from '@/components/ui/Card';
import { Sparkles, SkipForward, ImageIcon } from 'lucide-react';
import type { TranscriptLine, ImageOverlay, ImageGenerationResponse } from '@/lib/types/image-overlay';

interface ImageGeneratorProps {
  transcriptLines: TranscriptLine[];
  jobId: string;
  onImagesGenerated: (overlays: ImageOverlay[]) => void;
  onSkip: () => void;
}

interface ImageSlot {
  transcriptLine: TranscriptLine;
  prompt: string;
  imageUrl: string | null;
  imagePath: string | null;
  isGenerating: boolean;
  error: string | null;
  selectedTimestamp: number;
  duration: number;
}

export function ImageGenerator({
  transcriptLines,
  jobId,
  onImagesGenerated,
  onSkip,
}: ImageGeneratorProps) {
  // Select 3 evenly-spaced lines from transcript
  const selectedLines = selectEvenlySpacedLines(transcriptLines, 3);

  // Initialize image slots
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>(
    selectedLines.map((line) => ({
      transcriptLine: line,
      prompt: '...',
      imageUrl: null,
      imagePath: null,
      isGenerating: false,
      error: null,
      selectedTimestamp: line.startTime,
      duration: 2, // Default 2 seconds
    }))
  );

  const [loadingPrompts, setLoadingPrompts] = useState(true);

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
          // Fallback to default prompts
          setImageSlots((prev) =>
            prev.map((slot) => ({
              ...slot,
              prompt: generateDefaultPrompt(slot.transcriptLine.text),
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching image prompts:', error);
        // Fallback to default prompts
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
    setImageSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, selectedTimestamp: timestamp } : slot))
    );
  };

  const handleDurationChange = (index: number, duration: number) => {
    setImageSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, duration } : slot))
    );
  };

  const handleGenerateImage = async (index: number) => {
    const slot = imageSlots[index];
    if (!slot.prompt.trim()) {
      return;
    }

    // Set generating state
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

      // Update slot with generated image
      setImageSlots((prev) =>
        prev.map((s, i) =>
          i === index
            ? {
                ...s,
                imageUrl: data.imageUrl,
                imagePath: data.imagePath,
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

  const handleContinue = () => {
    // Filter out slots that have generated images
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

  const allImagesGenerated = imageSlots.every((slot) => slot.imageUrl !== null);
  const someImagesGenerated = imageSlots.some((slot) => slot.imageUrl !== null);

  return (
    <Card className="w-full max-w-3xl bg-white rounded-lg shadow-lg">
      {/* Simple Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Add Images to Video</h2>
        <p className="text-sm text-gray-600 mt-1">
          {loadingPrompts ? 'AI is suggesting images...' : 'Edit prompts and timing, then generate'}
        </p>
      </div>

      {/* Image Slots */}
      <div className="space-y-4">
        {loadingPrompts ? (
          // Simple loading
          <div className="space-y-4">
            {[0, 1, 2].map((index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-10 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          // Actual image slots - clean and simple
          <>
            {imageSlots.map((slot, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                {/* Script Line */}
                <div className="text-sm text-gray-700 mb-3">
                  &quot;{slot.transcriptLine.text}&quot;
                </div>

                {/* Image Prompt Input */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="What image to generate..."
                    value={slot.prompt}
                    onChange={(e) => handlePromptChange(index, e.target.value)}
                    disabled={slot.isGenerating}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-linkedin-blue disabled:opacity-50"
                  />
                  <Button
                    onClick={() => handleGenerateImage(index)}
                    disabled={slot.isGenerating || !slot.prompt.trim()}
                    loading={slot.isGenerating}
                    variant="primary"
                  >
                    {slot.isGenerating ? 'Generating...' : 'Generate'}
                  </Button>
                </div>

                {/* Dynamic Timestamp Selector */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-600 whitespace-nowrap">Show at:</span>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(29, Math.ceil(transcriptLines[transcriptLines.length - 1]?.endTime || 29))}
                      step="0.1"
                      value={slot.selectedTimestamp}
                      onChange={(e) => handleTimestampChange(index, parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="font-semibold text-linkedin-blue whitespace-nowrap min-w-[40px] text-right">
                      {formatTimestamp(slot.selectedTimestamp)}
                    </span>
                  </div>
                  {/* Show what's being said at this timestamp */}
                  <div className="text-xs text-gray-600 italic">
                    "{getTextAtTimestamp(transcriptLines, slot.selectedTimestamp)}"
                  </div>

                  {/* Duration Selector */}
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-600 whitespace-nowrap">Duration:</span>
                    <input
                      type="range"
                      min="0.5"
                      max="5"
                      step="0.5"
                      value={slot.duration}
                      onChange={(e) => handleDurationChange(index, parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="font-semibold text-linkedin-blue whitespace-nowrap min-w-[40px] text-right">
                      {slot.duration}s
                    </span>
                  </div>
                </div>

                {/* Error */}
                {slot.error && (
                  <div className="text-sm text-red-600 mt-2">
                    {slot.error}
                  </div>
                )}

                {/* Preview */}
                {slot.imageUrl && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 rounded border border-green-200">
                    <img
                      src={slot.imageUrl}
                      alt={`Image ${index + 1}`}
                      className="w-12 h-12 object-contain rounded"
                    />
                    <span className="text-sm text-green-700">✓ Ready</span>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
        <Button variant="ghost" onClick={onSkip}>
          Skip Images
        </Button>
        <Button onClick={handleContinue} disabled={!someImagesGenerated} variant="primary">
          Continue
        </Button>
      </div>
    </Card>
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
  // Generate a simple default prompt based on the line text
  // Users can modify this
  const cleanText = lineText.slice(0, 80);
  return `${cleanText}${lineText.length > 80 ? '...' : ''}`;
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

function getTextAtTimestamp(lines: TranscriptLine[], timestamp: number): string {
  // Find the line that contains this timestamp
  const line = lines.find(
    (l) => timestamp >= l.startTime && timestamp <= l.endTime
  );

  if (line) {
    return truncateText(line.text, 60);
  }

  // If not in any line, find the closest line
  const closest = lines.reduce((prev, curr) => {
    const prevDist = Math.abs(prev.startTime - timestamp);
    const currDist = Math.abs(curr.startTime - timestamp);
    return currDist < prevDist ? curr : prev;
  });

  return closest ? truncateText(closest.text, 60) : 'Start of video';
}
