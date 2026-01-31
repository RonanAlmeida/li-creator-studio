# Fal.ai Models - Quick Reference Guide

Complete guide to all Fal.ai image-to-video models available in Creator Studio.

## Available Models

### 1. WAN v2.6 Image-to-Video Flash (Default)

**When to use**: High-volume production, quick iterations, testing

```typescript
// Current default implementation
const result = await fal.subscribe('fal-ai/wan/v2.6/image-to-video/flash', {
  input: {
    image_url: imageDataUrl,
    prompt: "Smooth camera pan with subtle zoom",
    num_frames: 75,    // 3 seconds at 25fps
    fps: 25,
  },
  logs: true,
  onQueueUpdate: (update) => {
    console.log('[WAN Flash]', update.status);
  },
});

const videoUrl = result.data.video.url;
```

**Specifications**:
- Speed: 10-15 seconds
- Duration: 3-5 seconds
- Resolution: 1920x1080
- Cost: $0.03 per generation
- Quality: Good (optimized for speed)

---

### 2. Stable Video Diffusion

**When to use**: Marketing campaigns, product videos, social media content

```typescript
const result = await fal.subscribe('fal-ai/stable-video', {
  input: {
    image_url: imageDataUrl,
    motion_bucket_id: 127,  // 1-255 (higher = more motion)
    cond_aug: 0.02,         // 0.0-1.0 (variation strength)
    fps: 24,
    num_frames: 25,         // Max 25 frames
  },
  logs: true,
});

// Download and save
const videoUrl = result.data.video.url;
```

**Motion Bucket ID Guide**:
- `1-50`: Minimal motion (subtle movements)
- `51-127`: Medium motion (standard animations)
- `128-200`: High motion (dynamic movements)
- `201-255`: Very high motion (dramatic effects)

**Specifications**:
- Speed: 20-30 seconds
- Duration: 2-4 seconds (25 frames max)
- Resolution: 1024x576
- Cost: $0.08 per generation
- Quality: High (smooth, natural motion)

---

### 3. AnimateDiff

**When to use**: Premium campaigns, artistic videos, complex motion

```typescript
const result = await fal.subscribe('fal-ai/animatediff', {
  input: {
    image_url: imageDataUrl,
    prompt: "Cinematic camera movement, professional lighting, smooth pan and zoom",
    negative_prompt: "blurry, low quality, distorted, static, choppy",
    num_frames: 48,           // 8-48 frames (2 seconds at 24fps)
    motion_scale: 1.5,        // 0.0-2.0 (motion intensity)
    guidance_scale: 7.5,      // 1.0-20.0 (prompt adherence)
    num_inference_steps: 50,  // 20-100 (quality vs speed)
    seed: 42,                 // For reproducibility
  },
  logs: true,
});
```

**Parameter Guide**:

**motion_scale**:
- `0.5`: Minimal motion
- `1.0`: Standard motion
- `1.5`: Enhanced motion (recommended)
- `2.0`: Maximum motion

**guidance_scale**:
- `3-5`: More creative/varied results
- `7-9`: Balanced (recommended)
- `10-15`: Strict prompt following

**num_inference_steps**:
- `20-30`: Fast, lower quality
- `40-60`: Balanced (recommended)
- `70-100`: Highest quality, slower

**Specifications**:
- Speed: 30-60 seconds
- Duration: 2-8 seconds
- Resolution: 512x512 to 1024x1024
- Cost: $0.15 per generation
- Quality: Very High (cinematic)

---

### 4. Runway Gen-2

**When to use**: Professional work, client deliverables, enterprise content

```typescript
const result = await fal.subscribe('fal-ai/runway-gen2', {
  input: {
    image_url: imageDataUrl,
    prompt: "Professional product reveal with dynamic lighting and smooth camera movement",
    duration: 5,              // 4-5 seconds
    ratio: "9:16",           // "16:9", "9:16", "1:1"
    watermark: false,        // Remove watermark (if subscription allows)
  },
  logs: true,
});
```

**Aspect Ratios**:
- `"16:9"`: Landscape (YouTube, web)
- `"9:16"`: Vertical (Instagram, TikTok)
- `"1:1"`: Square (Instagram feed)

**Specifications**:
- Speed: 25-35 seconds
- Duration: 4-5 seconds
- Resolution: 1280x768 (16:9) or 768x1280 (9:16)
- Cost: $0.20 per generation
- Quality: Professional (realistic, high fidelity)

---

## Implementation Examples

### Basic Model Switch

```typescript
// lib/services/video-generation.service.ts

export async function generateVideo(
  imagePath: string,
  prompt: string,
  modelType: 'flash' | 'stable' | 'animate' | 'runway' = 'flash'
): Promise<string> {

  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const imageUrl = `data:image/jpeg;base64,${base64Image}`;

  let result;

  switch(modelType) {
    case 'flash':
      result = await fal.subscribe('fal-ai/wan/v2.6/image-to-video/flash', {
        input: { image_url: imageUrl, prompt, num_frames: 75, fps: 25 }
      });
      break;

    case 'stable':
      result = await fal.subscribe('fal-ai/stable-video', {
        input: { image_url: imageUrl, motion_bucket_id: 127, fps: 24 }
      });
      break;

    case 'animate':
      result = await fal.subscribe('fal-ai/animatediff', {
        input: {
          image_url: imageUrl,
          prompt,
          num_frames: 48,
          motion_scale: 1.5,
          guidance_scale: 7.5,
        }
      });
      break;

    case 'runway':
      result = await fal.subscribe('fal-ai/runway-gen2', {
        input: { image_url: imageUrl, prompt, duration: 5, ratio: "9:16" }
      });
      break;
  }

  return result.data.video.url;
}
```

### Environment-Based Configuration

```typescript
// .env
FAL_MODEL=flash  # 'flash', 'stable', 'animate', 'runway'

// Usage
const modelType = process.env.FAL_MODEL || 'flash';
const videoUrl = await generateVideo(imagePath, prompt, modelType);
```

### Quality Preset System

```typescript
export const QUALITY_PRESETS = {
  economy: {
    model: 'fal-ai/wan/v2.6/image-to-video/flash',
    params: { num_frames: 50, fps: 20 },
    cost: 0.03,
  },
  standard: {
    model: 'fal-ai/wan/v2.6/image-to-video/flash',
    params: { num_frames: 75, fps: 25 },
    cost: 0.03,
  },
  quality: {
    model: 'fal-ai/stable-video',
    params: { motion_bucket_id: 127, fps: 24 },
    cost: 0.08,
  },
  premium: {
    model: 'fal-ai/animatediff',
    params: { num_frames: 48, motion_scale: 1.5 },
    cost: 0.15,
  },
  professional: {
    model: 'fal-ai/runway-gen2',
    params: { duration: 5, ratio: "9:16" },
    cost: 0.20,
  },
};

// Usage
async function generateWithPreset(imagePath: string, preset: keyof typeof QUALITY_PRESETS) {
  const config = QUALITY_PRESETS[preset];
  const result = await fal.subscribe(config.model, {
    input: { image_url: imageDataUrl, ...config.params }
  });
  return result;
}
```

## Cost Calculator

```typescript
function calculateVideoCost(
  numVideos: number,
  model: 'flash' | 'stable' | 'animate' | 'runway'
): number {
  const costs = {
    flash: 0.03,
    stable: 0.08,
    animate: 0.15,
    runway: 0.20,
  };

  const baseCost = 0.23; // OpenAI + ElevenLabs + Gemini
  const videoCost = costs[model];
  const totalPerVideo = baseCost + videoCost;

  return totalPerVideo * numVideos;
}

// Examples
console.log(calculateVideoCost(20, 'flash'));    // $5.20/month
console.log(calculateVideoCost(20, 'stable'));   // $6.20/month
console.log(calculateVideoCost(20, 'animate'));  // $7.60/month
console.log(calculateVideoCost(20, 'runway'));   // $8.60/month
```

## Batch Processing

```typescript
async function batchGenerateVideos(
  images: string[],
  prompts: string[],
  model: string = 'fal-ai/wan/v2.6/image-to-video/flash'
): Promise<string[]> {
  const results = await Promise.all(
    images.map((imagePath, i) =>
      generateVideo(imagePath, prompts[i], model)
    )
  );

  return results;
}

// Usage
const images = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
const prompts = ['Zoom in', 'Pan left', 'Rotate'];
const videos = await batchGenerateVideos(images, prompts, 'stable');
```

## Error Handling

```typescript
async function generateVideoSafe(
  imagePath: string,
  prompt: string,
  modelType: string = 'flash'
): Promise<string | null> {
  try {
    const result = await generateVideo(imagePath, prompt, modelType);
    return result;
  } catch (error) {
    if (error.message.includes('rate limit')) {
      console.log('Rate limited, waiting 60s...');
      await sleep(60000);
      return generateVideoSafe(imagePath, prompt, modelType);
    }

    if (error.message.includes('insufficient credits')) {
      console.error('Fal.ai credits exhausted');
      // Fallback to FFmpeg loop
      return null;
    }

    throw error;
  }
}
```

## Best Practices

### 1. Prompt Engineering

**Good Prompts**:
- "Smooth camera pan from left to right with subtle zoom"
- "Professional product showcase with cinematic lighting"
- "Dynamic reveal with rotating camera movement"

**Bad Prompts**:
- "Make it move" (too vague)
- "Best video ever amazing quality" (unhelpful adjectives)
- "Camera goes everywhere fast" (conflicting instructions)

### 2. Image Preparation

```typescript
// Optimize image before sending to Fal.ai
import sharp from 'sharp';

async function prepareImage(imagePath: string): Promise<Buffer> {
  return await sharp(imagePath)
    .resize(1024, 1024, { fit: 'inside' })  // Max 1024x1024
    .jpeg({ quality: 90 })                   // High quality JPEG
    .toBuffer();
}
```

### 3. Caching Strategy

```typescript
// Cache generated videos to avoid regeneration
const videoCache = new Map<string, string>();

async function getCachedVideo(imageHash: string, prompt: string): Promise<string> {
  const cacheKey = `${imageHash}_${prompt}`;

  if (videoCache.has(cacheKey)) {
    console.log('Using cached video');
    return videoCache.get(cacheKey)!;
  }

  const videoUrl = await generateVideo(imagePath, prompt);
  videoCache.set(cacheKey, videoUrl);
  return videoUrl;
}
```

## Performance Tips

1. **Use WAN Flash for iteration**: Test with the fastest model, upgrade for final
2. **Batch process**: Generate multiple videos in parallel
3. **Cache results**: Don't regenerate the same video twice
4. **Optimize images**: Resize to appropriate dimensions before sending
5. **Monitor costs**: Track API usage with counters

## Troubleshooting

### Common Issues

**"Generation timed out"**:
- Increase timeout value
- Try a faster model (WAN Flash)
- Check Fal.ai status page

**"Video quality is poor"**:
- Upgrade to Stable Video or AnimateDiff
- Improve prompt with more details
- Use higher resolution input image

**"Too expensive"**:
- Use FFmpeg loop (current default)
- Switch to WAN Flash instead of premium models
- Generate fewer videos with higher quality

**"Motion is too subtle/intense"**:
- Adjust `motion_bucket_id` (Stable Video)
- Adjust `motion_scale` (AnimateDiff)
- Refine prompt with specific motion descriptions

---

**Last Updated**: January 2026
**Version**: 1.0.0
