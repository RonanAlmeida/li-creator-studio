export interface ImageOverlay {
  imagePath: string;    // Path to generated image file
  timestamp: number;    // Start time in seconds
  duration: number;     // Display duration in seconds (default 2s)
  x?: number;           // X position (optional, calculate from center)
  y?: number;           // Y position (optional, calculate above captions)
}

export interface TranscriptLine {
  text: string;         // Line text from script
  startTime: number;    // Estimated start time in seconds
  endTime: number;      // Estimated end time in seconds
}

export interface ImageGenerationRequest {
  prompt: string;
  jobId: string;
  imageIndex: number;
}

export interface ImageGenerationResponse {
  success: boolean;
  imagePath?: string;
  imageUrl?: string;    // Public URL for preview
  error?: string;
}
