# Creator Studio - Technical Documentation

## Architecture Overview

Creator Studio is built on Next.js 14 with a server-side processing pipeline for video generation. The application follows a modular architecture with clear separation between frontend components, API routes, and backend services.

## Video Processing Pipeline

### Complete Flow Diagram

```
User Input
    ↓
Script Generation (OpenAI GPT-4)
    ↓
Audio Generation (ElevenLabs TTS)
    ↓
Audio Transcription (OpenAI Whisper)
    ↓
Image Generation (Google Gemini) [Optional]
    ↓
Video Assembly (FFmpeg)
    ↓
Final Video Output
```

### Detailed Step Breakdown

#### Step 1: Script Generation
**Endpoint**: `/api/generate-script`

The script generation process can happen in two ways:

**Option A: From User Input**
- User enters a topic or idea
- System sends prompt to OpenAI GPT-4 Turbo
- AI generates structured script with:
  - Title (3-7 words, clickbait-style)
  - Script body (70-100 words, conversational tone)
  - Hashtags (3-5 relevant LinkedIn tags)

**Option B: From LinkedIn Post**
- User selects a post from the Post Library
- AI analyzes post content and image (if present)
- Generates 5 video ideas with:
  - Title
  - Description
  - Why it's engaging
- User selects one idea
- AI expands it into a full script

**Master Prompt**:
The script writer uses a customizable master prompt that defines:
- Tone and style (conversational, authentic)
- Structure (hook, body, soft CTA)
- Length constraints (20-60 seconds target)
- Formatting rules

#### Step 2: Audio Generation
**Service**: `lib/services/elevenlabs.service.ts`

Process:
1. Text script is sent to ElevenLabs API
2. Voice ID is specified (default: Charlotte)
3. API returns audio stream
4. Audio is saved as MP3 file in `/public/generated-videos/audio/{jobId}.mp3`
5. Duration is calculated and returned

**Available Voices**:
- Charlotte (friendly female)
- Daniel (professional male)
- Rachel (warm female)
- And 7 more options

**Parameters**:
- Model: `eleven_turbo_v2_5`
- Output format: MP3
- Sample rate: 44100 Hz

#### Step 3: Audio Transcription
**Endpoint**: `/api/audio/transcribe`
**Service**: `lib/services/whisper.service.ts`

Process:
1. Generated audio file is sent to OpenAI Whisper API
2. Whisper transcribes with word-level timestamps
3. Output is in SRT format (SubRip Subtitle)
4. SRT is parsed into structured transcript lines:
```typescript
interface TranscriptLine {
  text: string;
  startTime: number;  // in seconds
  endTime: number;    // in seconds
}
```

**Why Transcription?**:
- Ensures accurate caption timing
- Handles pronunciation variations
- Accounts for pauses and pacing
- Creates smooth caption transitions

#### Step 4: Image Generation (Optional)
**Endpoint**: `/api/generate-image`
**Service**: `lib/services/gemini-image.service.ts`

Process:
1. AI suggests image prompts based on script content
2. User can edit prompts or generate default images
3. Each image is assigned a timestamp and duration
4. Images are generated using Google Gemini Imagen API
5. Saved to `/public/generated-videos/images/{jobId}/image_{index}.png`

**Image Overlay Structure**:
```typescript
interface ImageOverlay {
  imagePath: string;   // Absolute path to image
  timestamp: number;   // When to show (seconds)
  duration: number;    // How long to show (seconds)
  x?: string;          // X position (optional)
  y?: string;          // Y position (optional)
}
```

**Smart Defaults**:
- Images appear at evenly distributed intervals
- Default duration: 2 seconds per image
- Positioned to not obstruct captions

#### Step 5: Video Assembly
**Endpoint**: `/api/video/overlay`
**Service**: `lib/services/video-overlay.service.ts`

This is the most complex step. Here's what happens:

**Input Components**:
- Base video template: `/public/generated-videos/videos/generated_from_post_vid.mp4`
- Generated audio: `/public/generated-videos/audio/{jobId}.mp3`
- Transcript SRT: `/public/generated-videos/srt/{jobId}.srt`
- Images (optional): `/public/generated-videos/images/{jobId}/*`
- Background music (optional): `/public/background-music/{filename}.mp3`

**Processing Steps**:

1. **Loop Base Video** (Cost Optimization):
   - Uses a 5-second base video template
   - Calculate required video length (matches audio duration)
   - Loop base video using FFmpeg to match duration
   - **Why this approach**: Dramatically reduces API costs
     - Generating 30s of unique video: $0.10-0.20 with Fal.ai
     - Looping 5s video with FFmpeg: $0.00 (free)
     - Saves ~85% on video generation costs
   - **Easy to change**: Switch to full-length generation by:
     - Calling Fal.ai for each video segment
     - Generating unique motion for entire duration
     - Trade-off: 2x cost, 3x generation time, higher quality
   - Creates extended base video ready for overlays

2. **Add Audio**:
   - Mix generated audio with base video
   - If background music selected, mix at 20% volume
   - Audio takes priority over background music

3. **Generate Caption Video**:
   - Create transparent video layer with captions
   - Use SRT file for timing
   - Apply caption styling:
     ```typescript
     {
       fontFamily: string;  // e.g., "Reddit Sans"
       fontSize: number;    // e.g., 24
       color: string;       // e.g., "#FFFFFF"
       position: string;    // "bottom", "top", "middle"
     }
     ```
   - Render text with outline/shadow for readability

4. **Overlay Images** (if provided):
   - For each image overlay:
     - Calculate position and timing
     - Create fade-in/fade-out transitions
     - Scale image to fit video dimensions
     - Composite onto video at specified timestamp

5. **Final Composition**:
   - Combine all layers:
     - Base video (looped)
     - Audio narration
     - Background music
     - Captions
     - Images
   - Export as single MP4 file
   - Save to `/public/generated-videos/final/{jobId}.mp4`

**FFmpeg Command Structure** (simplified):
```bash
ffmpeg -i base_video.mp4 \
       -i audio.mp3 \
       -i background_music.mp3 \
       -filter_complex "[video layers and overlays]" \
       -map "[final_video]" \
       -map audio_mix \
       output.mp4
```

#### Step 6: Output & Delivery

Final video specifications:
- **Format**: MP4 (H.264)
- **Resolution**: 416x752 pixels (vertical 9:16)
- **Frame Rate**: 30 fps
- **Audio**: AAC, 44100 Hz
- **Video Bitrate**: ~1500 kbps
- **File Size**: ~5-15 MB (for 30-60 second videos)

The video is served via:
- **URL**: `/generated-videos/final/{jobId}.mp4`
- **Preview**: Embedded video player in UI
- **Download**: Direct file download

## Fal.ai Integration

Creator Studio integrates multiple Fal.ai models for advanced image-to-video generation capabilities. The system is designed to be flexible, allowing easy switching between models based on quality, speed, and cost requirements.

### Available Image-to-Video Models

#### 1. WAN v2.6 Image-to-Video Flash (Default)

**Model ID**: `fal-ai/wan/v2.6/image-to-video/flash`

**Overview**:
The WAN (Warp-and-Animate) v2.6 Flash model is optimized for speed and cost-efficiency, making it ideal for high-volume video production.

**Specifications**:
- **Generation Time**: 10-15 seconds
- **Output Duration**: 3-5 seconds
- **Resolution**: 1080p (1920x1080)
- **Frame Rate**: 24 fps
- **Cost per Generation**: ~$0.03
- **Quality**: Good (optimized for speed)

**Input Parameters**:
```typescript
{
  image_url: string,      // base64 data URL or public URL
  prompt: string,         // Motion description
  num_frames?: number,    // Default: 75 (3 seconds at 25fps)
  fps?: number,          // Default: 25
}
```

**Example Usage**:
```typescript
const result = await fal.subscribe('fal-ai/wan/v2.6/image-to-video/flash', {
  input: {
    image_url: imageDataUrl,
    prompt: "Smooth camera pan across product with subtle zoom",
    num_frames: 75,
    fps: 25,
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === 'IN_PROGRESS') {
      console.log('Progress:', update.logs);
    }
  },
});

const videoUrl = result.data.video.url;
```

**Best For**:
- Rapid prototyping and testing
- High-volume content production
- Budget-conscious projects
- Quick iterations

---

#### 2. Stable Video Diffusion

**Model ID**: `fal-ai/stable-video`

**Overview**:
Stable Video Diffusion provides higher quality motion with smoother animations, suitable for marketing content and professional use.

**Specifications**:
- **Generation Time**: 20-30 seconds
- **Output Duration**: 2-4 seconds
- **Resolution**: Up to 1024x576
- **Frame Rate**: 6-24 fps
- **Cost per Generation**: ~$0.08
- **Quality**: High (smooth, natural motion)

**Input Parameters**:
```typescript
{
  image_url: string,
  motion_bucket_id?: number,  // 1-255, controls motion intensity
  cond_aug?: number,          // 0.0-1.0, controls variation
  fps?: number,               // 6-24
  num_frames?: number,        // Max 25
}
```

**Example Usage**:
```typescript
const result = await fal.subscribe('fal-ai/stable-video', {
  input: {
    image_url: imageDataUrl,
    motion_bucket_id: 127,  // Medium motion
    fps: 24,
    num_frames: 25,
  },
});
```

**Best For**:
- Marketing videos
- Product demonstrations
- Social media content
- Smoother motion requirements

---

#### 3. AnimateDiff

**Model ID**: `fal-ai/animatediff`

**Overview**:
AnimateDiff offers the highest quality with complex motion capabilities, ideal for premium campaigns and artistic videos.

**Specifications**:
- **Generation Time**: 30-60 seconds
- **Output Duration**: 2-8 seconds
- **Resolution**: 512x512 to 1024x1024
- **Frame Rate**: 8-24 fps
- **Cost per Generation**: ~$0.15
- **Quality**: Very High (cinematic, complex motion)

**Input Parameters**:
```typescript
{
  image_url: string,
  prompt: string,
  negative_prompt?: string,
  num_frames?: number,        // 8-48 frames
  motion_scale?: number,      // 0.0-2.0, motion intensity
  guidance_scale?: number,    // 1.0-20.0, prompt adherence
  num_inference_steps?: number, // 20-100, quality vs speed
}
```

**Example Usage**:
```typescript
const result = await fal.subscribe('fal-ai/animatediff', {
  input: {
    image_url: imageDataUrl,
    prompt: "Cinematic camera movement, professional lighting, smooth pan",
    negative_prompt: "blurry, low quality, distorted",
    num_frames: 48,           // 2 seconds at 24fps
    motion_scale: 1.5,        // Enhanced motion
    guidance_scale: 7.5,
    num_inference_steps: 50,
  },
});
```

**Best For**:
- Premium brand videos
- Artistic content
- Complex motion requirements
- High-end campaigns

---

#### 4. Runway Gen-2

**Model ID**: `fal-ai/runway-gen2`

**Overview**:
Runway Gen-2 provides professional-grade video generation with realistic motion and high fidelity.

**Specifications**:
- **Generation Time**: 25-35 seconds
- **Output Duration**: 4-5 seconds
- **Resolution**: 1280x768
- **Frame Rate**: 24 fps
- **Cost per Generation**: ~$0.20
- **Quality**: Professional (realistic, high fidelity)

**Input Parameters**:
```typescript
{
  image_url: string,
  prompt: string,
  duration?: number,    // 4-5 seconds
  ratio?: string,       // "16:9", "9:16", "1:1"
}
```

**Example Usage**:
```typescript
const result = await fal.subscribe('fal-ai/runway-gen2', {
  input: {
    image_url: imageDataUrl,
    prompt: "Professional product reveal with dynamic lighting",
    duration: 5,
    ratio: "9:16",  // Vertical for social media
  },
});
```

**Best For**:
- Enterprise content
- Professional video production
- Realistic motion requirements
- Client-facing deliverables

---

### Model Comparison Matrix

| Feature | WAN v2.6 Flash | Stable Video | AnimateDiff | Runway Gen-2 |
|---------|---------------|--------------|-------------|--------------|
| **Speed** | ⚡⚡⚡ (10-15s) | ⚡⚡ (20-30s) | ⚡ (30-60s) | ⚡⚡ (25-35s) |
| **Quality** | Good | High | Very High | Professional |
| **Max Duration** | 5s | 4s | 8s | 5s |
| **Resolution** | 1920x1080 | 1024x576 | 1024x1024 | 1280x768 |
| **Cost/Gen** | $0.03 | $0.08 | $0.15 | $0.20 |
| **Motion Complexity** | Simple | Medium | Complex | Realistic |
| **Best Use** | Volume | Marketing | Premium | Professional |

### Implementation Guide

#### Switching Between Models

**1. Create Model Configuration** (add to `lib/constants/fal-models.ts`):

```typescript
export const FAL_MODELS = {
  WAN_FLASH: {
    id: 'fal-ai/wan/v2.6/image-to-video/flash',
    name: 'WAN v2.6 Flash',
    cost: 0.03,
    duration: 5,
    generationTime: 15,
  },
  STABLE_VIDEO: {
    id: 'fal-ai/stable-video',
    name: 'Stable Video Diffusion',
    cost: 0.08,
    duration: 4,
    generationTime: 25,
  },
  ANIMATE_DIFF: {
    id: 'fal-ai/animatediff',
    name: 'AnimateDiff',
    cost: 0.15,
    duration: 8,
    generationTime: 45,
  },
  RUNWAY_GEN2: {
    id: 'fal-ai/runway-gen2',
    name: 'Runway Gen-2',
    cost: 0.20,
    duration: 5,
    generationTime: 30,
  },
} as const;
```

**2. Update Video Generation Service**:

```typescript
// lib/services/video-generation.service.ts

export async function generateVideo(
  options: VideoGenerationOptions,
  jobId: string,
  modelId: string = FAL_MODELS.WAN_FLASH.id
): Promise<VideoGenerationResult> {
  // Set API key
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) throw new Error('FAL_KEY not configured');

  // Model-specific parameters
  let input: any;

  switch(modelId) {
    case FAL_MODELS.WAN_FLASH.id:
      input = {
        image_url: imageUrl,
        prompt: options.prompt,
        num_frames: 75,
        fps: 25,
      };
      break;

    case FAL_MODELS.STABLE_VIDEO.id:
      input = {
        image_url: imageUrl,
        motion_bucket_id: 127,
        fps: 24,
        num_frames: 25,
      };
      break;

    case FAL_MODELS.ANIMATE_DIFF.id:
      input = {
        image_url: imageUrl,
        prompt: options.prompt,
        negative_prompt: "blurry, low quality",
        num_frames: 48,
        motion_scale: 1.5,
        guidance_scale: 7.5,
      };
      break;

    case FAL_MODELS.RUNWAY_GEN2.id:
      input = {
        image_url: imageUrl,
        prompt: options.prompt,
        duration: 5,
        ratio: "9:16",
      };
      break;
  }

  // Call Fal.ai with selected model
  const result = await fal.subscribe(modelId, {
    input,
    logs: true,
    onQueueUpdate: (update) => {
      console.log(`[${modelId}] Status:`, update.status);
    },
  });

  return processResult(result, jobId);
}
```

**3. Environment-Based Selection**:

```typescript
// .env
FAL_MODEL_PRESET=quality  # 'speed', 'balanced', 'quality', 'premium'

// Code
function selectModelByPreset(preset: string): string {
  const presets = {
    speed: FAL_MODELS.WAN_FLASH.id,
    balanced: FAL_MODELS.STABLE_VIDEO.id,
    quality: FAL_MODELS.ANIMATE_DIFF.id,
    premium: FAL_MODELS.RUNWAY_GEN2.id,
  };
  return presets[preset] || FAL_MODELS.WAN_FLASH.id;
}
```

### Cost-Benefit Analysis

**Example: 30-second video requiring 6 segments (5s each)**

| Model | Generation Time | Cost per Segment | Total Cost | Total Time | Use Case |
|-------|----------------|------------------|------------|------------|----------|
| **FFmpeg Loop** | Instant | $0.00 | **$0.00** | 0s | Current default |
| WAN v2.6 Flash | 10-15s | $0.03 | **$0.18** | 60-90s | Fast iteration |
| Stable Video | 20-30s | $0.08 | **$0.48** | 120-180s | Marketing |
| AnimateDiff | 30-60s | $0.15 | **$0.90** | 180-360s | Premium |
| Runway Gen-2 | 25-35s | $0.20 | **$1.20** | 150-210s | Professional |

**Recommendation**:
- **Default**: FFmpeg loop (current) - $0.00, instant
- **When quality matters**: Stable Video - $0.48, 2-3 minutes
- **Premium campaigns**: AnimateDiff or Runway Gen-2 - $0.90-1.20, 3-6 minutes

### Current Strategy

The system uses a **hybrid approach**:

1. **Base Background**: FFmpeg loop ($0.00)
2. **Image Overlays**: Static images with fade transitions
3. **Reserved for Premium**: Fal.ai models available when needed

This provides 95% of the quality at 0% of the video generation cost.

### Future Enhancements

- **Model Selection UI**: Let users choose quality tier
- **Segment-Based Generation**: Use Fal.ai for key segments only
- **Batch Processing**: Generate multiple videos in parallel
- **Custom Motion Prompts**: Fine-tune motion for each segment
- **Quality Presets**: One-click quality settings

## API Endpoints Reference

### POST /api/generate-script
Generate AI script from user input or post.

**Request**:
```json
{
  "userInput": "string",
  "masterPrompt": "string (optional)"
}
```

**Response**:
```json
{
  "script": "TITLE: ...\n\nSCRIPT: ...\n\nHASHTAGS: ..."
}
```

### POST /api/audio/transcribe
Generate audio and transcribe with timestamps.

**Request**:
```json
{
  "text": "string",
  "voiceId": "string"
}
```

**Response**:
```json
{
  "success": true,
  "jobId": "string",
  "duration": number,
  "audioPath": "string",
  "srtPath": "string",
  "transcriptLines": [
    {
      "text": "string",
      "startTime": number,
      "endTime": number
    }
  ]
}
```

### POST /api/generate-image
Generate AI image from prompt.

**Request**:
```json
{
  "prompt": "string",
  "jobId": "string",
  "imageIndex": number
}
```

**Response**:
```json
{
  "success": true,
  "imagePath": "string",
  "imageUrl": "string"
}
```

### POST /api/video/generate-ad
Generate ad campaign video with image slideshow.

**Request** (multipart/form-data):
```typescript
{
  caption: string,           // Ad headline (max 100 chars)
  script: string,           // Voiceover script
  voiceId: string,          // ElevenLabs voice ID
  musicId: string,          // Background music ID or "none"
  captionOptions: string,   // JSON stringified caption options
  images: File[],           // Array of uploaded images (3-5 recommended)
}
```

**Response**:
```json
{
  "success": true,
  "video": {
    "id": "ad_abc123",
    "url": "/generated-videos/final/ad_abc123.mp4",
    "thumbnail": "/sample-thumbnail.jpg",
    "duration": 30.5,
    "resolution": "1080x1920",
    "captionsIncluded": true,
    "createdAt": "2024-01-30T12:00:00Z"
  }
}
```

**Process**:
1. Validates caption, script, and images
2. Generates unique job ID with 'ad_' prefix
3. Saves uploaded images to `/public/generated-videos/images/{jobId}/`
4. Calculates video duration based on script word count
5. Distributes images evenly across video timeline
6. Creates image overlays (2 seconds each)
7. Uses base campaign video as background
8. Overlays audio narration, captions, images, and music
9. Returns final ad video

**Image Overlay Timing**:
- Script duration = wordCount / 2.5 seconds
- Interval between images = duration / (imageCount + 1)
- Each image appears at: (index + 1) × interval
- Each image displays for 2 seconds

**Example**:
- Script: 75 words = 30 seconds
- Images: 3 uploaded
- Interval: 30 / 4 = 7.5 seconds
- Image 1: appears at 7.5s
- Image 2: appears at 15s
- Image 3: appears at 22.5s

### POST /api/video/overlay
Main video generation endpoint.

**Request**:
```json
{
  "text": "string",
  "voiceId": "string",
  "captions": {
    "enabled": boolean,
    "position": "bottom" | "top" | "middle",
    "style": "default" | "bold",
    "size": number,
    "color": "string",
    "fontFamily": "string"
  },
  "backgroundMusic": "string (optional)",
  "imageOverlays": [
    {
      "imagePath": "string",
      "timestamp": number,
      "duration": number
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "video": {
    "id": "string",
    "url": "string",
    "thumbnail": "string",
    "duration": number,
    "resolution": "string",
    "captionsIncluded": boolean,
    "captionOptions": {},
    "createdAt": "string"
  }
}
```

## Component Architecture

### Video Creation Wizard
**File**: `components/wizard/VideoCreationWizard.tsx`

8-step wizard that guides users through video creation:

1. **Step 1 - Script Input**: Enter script and optional file upload
2. **Step 2 - Hashtags**: Add or edit LinkedIn hashtags
3. **Step 3 - Voice**: Select AI voice for narration
4. **Step 4 - Music**: Choose background music
5. **Step 5 - Captions**: Customize caption styling
6. **Step 6 - Images**: Generate or skip AI images
7. **Step 7 - Review**: Confirm all settings
8. **Step 8 - Preview**: Watch and download final video

**State Management**:
```typescript
interface WizardState {
  currentStep: number;
  completedSteps: Set<number>;
  scriptText: string;
  captionText: string;
  hashtags: string;
  selectedVoiceId: string;
  selectedMusicId: string;
  captionOptions: CaptionOptions;
  imageOverlays: ImageOverlay[];
  transcriptLines: TranscriptLine[];
  generatedVideo: VideoResult | null;
}
```

### AI Script Writer
**File**: `components/studio/ScriptEditor.tsx`

Chat-based interface for script generation:

**Features**:
- Quick start prompts for common scenarios
- Video ideas generation from posts
- Script editing with `/edit` commands
- Carousel view for browsing ideas
- One-click "Use This Script" integration

**Edit Commands**:
- `/edit rewrite` - Generate new version
- `/edit shorter` - Condense script
- `/edit longer` - Add more detail
- `/edit casual` - Make more conversational
- `/edit professional` - Polish for corporate
- `/edit [custom]` - Custom modifications

### Post Library
**File**: `components/studio/PostLibrary.tsx`

Browse and import LinkedIn posts:

**Features**:
- View your posts and saved posts
- Scroll through post feed
- One-click "Send to Script Writer"
- Preserves post images for video creation

## Video Generation Architecture

### Base Video Loop vs. Full Generation

The system uses a **hybrid approach** optimizing for cost and speed while maintaining quality.

#### Current Implementation: Looped Base Video

**How It Works**:
```typescript
// 1. Start with 5-second base video
const baseVideo = 'generated_from_post_vid.mp4'; // 5 seconds

// 2. Calculate required duration
const audioDuration = 32; // seconds

// 3. Loop video using FFmpeg
ffmpeg -stream_loop 6 -i base_video.mp4 -t 32 output.mp4
// Result: 5s video looped 6.4 times = 32s video
```

**Advantages**:
- **Cost**: $0.00 per video (vs $0.10-0.20 with Fal.ai)
- **Speed**: Instant (vs 15-30s generation time)
- **Quality**: Consistent base aesthetic
- **Reliability**: No API failures or rate limits

**Disadvantages**:
- Repetitive background motion
- Less visual variety
- Not unique per video

#### Alternative: Full-Length Generation with Fal.ai

**How to Enable**:

1. **Modify** `lib/services/video-overlay.service.ts`:
```typescript
// Instead of looping base video:
import { generateVideo } from './video-generation.service';

// Generate unique video for full duration
const uniqueVideo = await generateVideo({
  prompt: "Professional background with subtle motion",
  duration: audioDuration,
}, jobId);

// Use generated video instead of looped base
const baseVideoPath = uniqueVideo.videoPath;
```

2. **Segment-Based Generation** (Recommended for quality):
```typescript
// Generate unique video for each script segment
const segments = splitScriptIntoSegments(script, 5); // 5s segments

for (const segment of segments) {
  const video = await generateVideo({
    prompt: segment.visualDescription,
    duration: 5,
  }, `${jobId}_seg_${segment.index}`);

  videoSegments.push(video);
}

// Stitch segments together
const finalVideo = await stitchVideoSegments(videoSegments);
```

**Cost Comparison**:
- Looped approach: $0.00 per video
- Full generation: $0.10-0.20 per video
- Segment approach: $0.20-0.40 per video (higher quality)

**When to Use Full Generation**:
- High-budget campaigns
- Premium client work
- Brand videos requiring unique visuals
- One-off important announcements
- A/B testing visual variations

**When to Use Looped Approach**:
- Regular content production
- High-volume campaigns
- Testing and iteration
- Budget-conscious projects
- Speed is priority

### Configuration

Add to `.env` for full generation mode:
```env
# Video generation mode
VIDEO_GENERATION_MODE=loop  # or 'full' for Fal.ai generation
FAL_GENERATION_DURATION=5   # Seconds per generation
```

Implement mode switch in code:
```typescript
const useFullGeneration = process.env.VIDEO_GENERATION_MODE === 'full';

if (useFullGeneration) {
  // Use Fal.ai for unique video
  baseVideoPath = await generateUniqueVideo(script, jobId);
} else {
  // Use looped base video (default)
  baseVideoPath = loopBaseVideo(duration);
}
```

## Performance Optimization

### Caching Strategy

1. **Image Generation**:
   - Check if image exists before generating
   - Reuse images with same jobId and index
   - Saves API credits and generation time

2. **Audio Files**:
   - Audio/SRT kept for regeneration
   - Only regenerate if script changes
   - Reduces ElevenLabs API calls

3. **Video Processing**:
   - Base video template cached in memory
   - FFmpeg processes run in background
   - Temporary files cleaned up after completion

### API Cost Management

**Estimated Costs per Video**:
- OpenAI (Script): ~$0.02
- OpenAI (Whisper): ~$0.01
- ElevenLabs (Audio): ~$0.05
- Gemini (Images, 3 images): ~$0.15
- **Total**: ~$0.23 per video

**Cost Reduction Tips**:
- Skip image generation when not needed
- Reuse audio for caption/music tweaks
- Use shorter scripts for testing

## Error Handling

### Common Errors & Solutions

**"API Keys Not Configured"**:
- Check `.env` file exists
- Verify all 4 API keys are set
- Restart dev server after adding keys

**"FFmpeg not found"**:
- Install FFmpeg: `brew install ffmpeg` (Mac)
- Ensure FFmpeg is in system PATH
- Test: `ffmpeg -version`

**"Audio generation failed"**:
- Check ElevenLabs API key validity
- Verify account has credits
- Check script length (max 3000 chars)

**"Transcription failed"**:
- Ensure audio file exists
- Check OpenAI API key
- Verify audio format is supported

**"Video generation timeout"**:
- Increase timeout in API route
- Check FFmpeg installation
- Reduce video complexity (fewer images)

## Testing

### Manual Testing Checklist

- [ ] Generate script from prompt
- [ ] Import post to script writer
- [ ] Create video with default settings
- [ ] Customize voice selection
- [ ] Add background music
- [ ] Modify caption styling
- [ ] Generate AI images
- [ ] Download final video
- [ ] Verify video quality
- [ ] Check caption synchronization

### Performance Benchmarks

**Typical Generation Times**:
- Script generation: 3-8 seconds
- Audio generation: 5-10 seconds
- Transcription: 3-5 seconds
- Image generation (per image): 8-12 seconds
- Video assembly: 10-20 seconds

**Total Time**: 30-60 seconds per video (with 3 images)

## Security Considerations

1. **API Keys**: Stored in server-side `.env`, never exposed to client
2. **File Upload**: Validated for type and size
3. **Input Sanitization**: Text inputs cleaned before processing
4. **Rate Limiting**: Consider adding for production
5. **File Cleanup**: Temporary files deleted after processing

## Deployment

### Environment Variables

Required in production:
```env
NODE_ENV=production
OPEN_AI_API_KEY=***
ELEVENLABS_API_KEY=***
GEMINI_API_KEY=***
FAL_KEY=***
```

### System Requirements

**Server**:
- Node.js 18+
- FFmpeg installed
- 2GB+ RAM
- 10GB+ storage (for video cache)

**Recommended**:
- 4GB+ RAM for concurrent video processing
- SSD for faster video I/O
- CDN for serving generated videos

### Deployment Platforms

**Recommended**: Vercel, Railway, or dedicated VPS

**Note**: Serverless platforms may have timeout issues with video processing. Consider:
- Splitting video processing to background jobs
- Using cloud storage for video files
- Implementing queuing system for high load

## Future Enhancements

### Planned Features

1. **Batch Processing**: Generate multiple videos from post library
2. **Video Templates**: Pre-designed styles and layouts
3. **Brand Kits**: Custom fonts, colors, logos
4. **Analytics**: Track video performance metrics
5. **Direct Posting**: LinkedIn API integration
6. **Video Editing**: Trim, splice, add effects
7. **Collaboration**: Team workflows and approvals

### Technical Improvements

1. **Queue System**: Redis/Bull for job processing
2. **Cloud Storage**: S3/GCS for video files
3. **Database**: PostgreSQL for video metadata
4. **Webhooks**: Status notifications
5. **API Versioning**: v1, v2 endpoints
6. **WebSockets**: Real-time generation progress

## Troubleshooting

### Debug Mode

Enable verbose logging:
```typescript
// In services
console.log('[DEBUG]', stepName, data);
```

Check logs:
- Browser console for client errors
- Server terminal for API errors
- `/public/generated-videos/` for file outputs

### Common Issues

**Videos not playing**:
- Check video codec compatibility
- Verify file path is correct
- Ensure video finished processing

**Captions out of sync**:
- Regenerate with fresh transcription
- Check SRT file format
- Verify audio duration matches

**Low video quality**:
- Increase FFmpeg bitrate
- Use higher resolution base video
- Check compression settings

## Contributing

### Code Style

- Use TypeScript for type safety
- Follow Airbnb style guide
- Add JSDoc comments for complex functions
- Keep functions under 50 lines

### Pull Request Process

1. Create feature branch
2. Write descriptive commit messages
3. Test all video generation paths
4. Update documentation
5. Submit PR with screenshots

---

**Last Updated**: January 2026
**Version**: 1.0.0
