# Creator Studio

A powerful AI-driven video creation platform that transforms LinkedIn posts and text into engaging short-form videos with AI-generated narration, captions, and visual elements.

## Overview

Creator Studio simplifies video content creation by automating the entire production pipeline. Transform your LinkedIn posts or text ideas into professional videos with just a few clicks.

## Features

- **Post to Video**: Turn existing LinkedIn posts into video content
- **AI Script Writer**: Generate engaging video scripts from ideas or posts
- **Ad Campaign Mode**: Create promotional videos and marketing campaigns
- **Text to Video**: Convert written scripts into narrated videos
- **Image to Video**: Add visuals to your video content
- **AI Voice Narration**: Natural-sounding voiceovers using ElevenLabs
- **Auto-Generated Captions**: Synchronized captions with customizable styling
- **Background Music**: Add licensed music to enhance your videos
- **AI Image Generation**: Create visuals that match your script timing

## How Video Creation Works

The video creation process follows these steps:

### 1. Script Generation (Optional)
- Import a LinkedIn post or write your own script
- AI generates an engaging video script with:
  - Catchy title (used as video caption)
  - Conversational script body (60-100 words)
  - Relevant hashtags for LinkedIn

### 2. Audio Generation
- Text is converted to speech using **ElevenLabs Text-to-Speech API**
- Choose from multiple AI voices (default: Charlotte - friendly female voice)
- Audio is saved and prepared for transcription

### 3. Audio Transcription
- Audio is transcribed using **OpenAI Whisper API**
- Generates word-level timestamps in SRT format
- Creates transcript lines with precise start/end times for caption synchronization

### 4. Image Generation (Optional)
- Uses **Google Gemini Imagen API** to generate images
- AI suggests image prompts based on your script content
- Images are timed to appear at specific moments in the video
- Generated images are overlaid with smooth transitions

### 5. Video Assembly
- Starts with a base video template (looped to match audio duration)
- **Cost-Saving Approach**: Uses a 5-second base video that loops throughout
  - Significantly reduces video generation costs
  - Can easily be changed to generate full-length unique videos using Fal.ai
  - Current approach optimized for speed and API cost efficiency
- Overlays AI-generated audio narration
- Adds synchronized captions using FFmpeg
- Inserts AI-generated images at specified timestamps
- Applies background music (if selected)
- Exports final video as MP4

### 6. Final Output
- High-quality video ready for LinkedIn
- Resolution: 416x752 (optimized for mobile viewing)
- Includes captions, narration, visuals, and music
- Downloadable and ready to post

## APIs & Services Used

### OpenAI API
- **Purpose**: AI script generation and audio transcription
- **Models Used**:
  - GPT-4 Turbo for script writing
  - Whisper for audio transcription with timestamps
- **Get API Key**: https://platform.openai.com/api-keys

### ElevenLabs API
- **Purpose**: AI voice narration and text-to-speech
- **Features**:
  - Natural-sounding voices
  - Multiple voice options
  - High-quality audio output
- **Get API Key**: https://elevenlabs.io/app/settings/api-keys

### Google Gemini API
- **Purpose**: AI image generation using Imagen
- **Features**:
  - Context-aware image generation
  - High-quality visuals
  - Fast generation times
- **Get API Key**: https://makersuite.google.com/app/apikey

### Fal.ai API
- **Purpose**: Advanced video generation and image-to-video conversion
- **Get API Key**: https://fal.ai/dashboard/keys

#### Available Image-to-Video Models

Fal.ai offers multiple models for image-to-video generation, each optimized for different use cases:

##### 1. WAN v2.6 Image-to-Video Flash (Currently Implemented)
- **Model ID**: `fal-ai/wan/v2.6/image-to-video/flash`
- **Speed**: ⚡ Fastest (10-15 seconds)
- **Quality**: Good
- **Duration**: 3-5 seconds per generation
- **Cost**: $ (Most affordable)
- **Best For**: Quick iterations, testing, high-volume production
- **Use Case**: Current default for rapid video generation

##### 2. Stable Video Diffusion
- **Model ID**: `fal-ai/stable-video`
- **Speed**: Medium (20-30 seconds)
- **Quality**: High
- **Duration**: 2-4 seconds per generation
- **Cost**: $$ (Moderate)
- **Best For**: Higher quality motion, smooth animations
- **Use Case**: Premium content where quality matters

##### 3. AnimateDiff
- **Model ID**: `fal-ai/animatediff`
- **Speed**: Slower (30-60 seconds)
- **Quality**: Very High
- **Duration**: Up to 8 seconds per generation
- **Cost**: $$$ (Higher cost)
- **Best For**: Complex motion, artistic videos, cinematic effects
- **Use Case**: High-end campaigns, brand videos

##### 4. Runway Gen-2
- **Model ID**: `fal-ai/runway-gen2`
- **Speed**: Medium (25-35 seconds)
- **Quality**: Professional
- **Duration**: 4-5 seconds per generation
- **Cost**: $$$ (Premium)
- **Best For**: Professional video production, realistic motion
- **Use Case**: Enterprise-level content creation

#### Model Comparison Table

| Model | Speed | Quality | Duration | Cost/Video | Best Use Case |
|-------|-------|---------|----------|------------|---------------|
| **WAN v2.6 Flash** ✅ | ⚡⚡⚡ | ⭐⭐⭐ | 3-5s | $0.03 | Rapid production |
| Stable Video | ⚡⚡ | ⭐⭐⭐⭐ | 2-4s | $0.08 | Quality content |
| AnimateDiff | ⚡ | ⭐⭐⭐⭐⭐ | 2-8s | $0.15 | Premium campaigns |
| Runway Gen-2 | ⚡⚡ | ⭐⭐⭐⭐⭐ | 4-5s | $0.20 | Professional work |

✅ = Currently implemented

#### How to Switch Models

To use a different Fal.ai model, modify `lib/services/video-generation.service.ts`:

```typescript
// Current (WAN v2.6 Flash)
result = await fal.subscribe('fal-ai/wan/v2.6/image-to-video/flash', {
  input: { image_url: imageUrl, prompt: options.prompt }
});

// Switch to Stable Video Diffusion
result = await fal.subscribe('fal-ai/stable-video', {
  input: { image_url: imageUrl, prompt: options.prompt }
});

// Or AnimateDiff for highest quality
result = await fal.subscribe('fal-ai/animatediff', {
  input: {
    image_url: imageUrl,
    prompt: options.prompt,
    num_frames: 48, // 2 seconds at 24fps
    motion_scale: 1.5 // Control motion intensity
  }
});
```

#### Recommended Configuration by Use Case

**High-Volume Content Production** (Current):
- Model: WAN v2.6 Flash
- Reason: Fastest, most cost-effective
- Estimated cost: $0.03 per 5-second video

**Marketing Campaigns**:
- Model: Stable Video Diffusion
- Reason: Better quality, smooth motion
- Estimated cost: $0.08 per 4-second video

**Premium Brand Videos**:
- Model: AnimateDiff or Runway Gen-2
- Reason: Professional quality, cinematic motion
- Estimated cost: $0.15-0.20 per video

**Current Strategy**: The system uses FFmpeg video looping ($0.00/video) for base backgrounds and reserves Fal.ai for premium features. This hybrid approach balances cost and quality.

#### Decision Tree: Which Approach to Use?

```
Need video generation?
│
├─ High volume (10+ videos/day)
│  └─ Use: FFmpeg Loop (Current) - $0.00/video
│
├─ Marketing campaign (5-10 videos)
│  └─ Use: WAN v2.6 Flash - $0.03/video
│
├─ Important product launch
│  └─ Use: Stable Video Diffusion - $0.08/video
│
├─ Premium brand content
│  └─ Use: AnimateDiff - $0.15/video
│
└─ Professional/Client work
   └─ Use: Runway Gen-2 - $0.20/video
```

## Post to Video Feature

The Post to Video feature lets you transform LinkedIn posts into engaging video content:

1. **Select a Post**: Choose from your LinkedIn posts in the left sidebar
2. **Send to Script Writer**: Click "Send to Script Writer" on any post
3. **AI Generates Ideas**: The AI analyzes your post and suggests 5 video ideas
4. **Pick an Idea**: Review the ideas and select one to develop into a full script
5. **Generate Script**: AI creates a complete video script based on the chosen idea
6. **Create Video**: Use the wizard to customize voice, music, captions, and images
7. **Export**: Download your finished video ready for posting

This workflow helps you repurpose existing content and multiply your reach across formats.

## Ad Campaign Mode

Ad Mode is a specialized workflow designed for creating promotional video content and marketing campaigns. It streamlines the ad creation process by focusing on visual storytelling with multiple images.

### Key Differences from Studio Mode

| Feature | Studio Mode | Ad Mode |
|---------|-------------|---------|
| **Purpose** | Organic content & thought leadership | Promotional & marketing campaigns |
| **Workflow** | 8-step comprehensive wizard | 3-step streamlined process |
| **Content Source** | AI Script Writer + Post Library | Direct script input |
| **Images** | AI-generated (optional) | User-uploaded (required, 3-5) |
| **Video Style** | Educational, conversational | Promotional, sales-focused |
| **Process** | Post → Ideas → Script → Generate | Script → Upload → Generate |
| **Base Video** | Looped background template | Campaign-specific background |
| **Image Display** | Overlaid at specific script moments | Slideshow throughout video |
| **Best For** | Tips, insights, stories, expertise | Product demos, offers, events |
| **Typical Length** | 30-60 seconds | 20-45 seconds |
| **Output Focus** | Engagement & education | Conversions & action |

### Ad Mode Features

#### 1. Streamlined Workflow
- **3-Step Process**: Content → Images → Preview
- **Faster Creation**: Skip unnecessary steps for quick turnaround
- **Campaign-Optimized**: Built specifically for promotional videos

#### 2. Image-First Approach
- Upload 3-5 product/brand images
- Drag-and-drop interface for easy uploading
- Automatic slideshow timing based on script length
- Images display at evenly distributed intervals

#### 3. Ad-Specific Customization
- **Ad Caption**: Short, punchy headline (max 100 characters)
- **Ad Script**: Focused voiceover copy (20-60 seconds recommended)
- **Voice Selection**: Choose tone that matches your brand
- **Background Music**: Enhance emotional impact
- **Caption Styling**: Customize to match brand colors

### How Ad Mode Works

#### Step 1: Create Content
1. Write an attention-grabbing ad caption
   - Example: "Boost Your Productivity with GSOBA"
2. Write the ad script (voiceover narration)
   - Keep it concise: 20-60 seconds
   - Include clear value proposition
   - End with call-to-action
3. Select voice, music, and caption styling

#### Step 2: Upload Images
1. Upload 3-5 high-quality images
   - Product shots
   - Feature screenshots
   - Brand visuals
   - Team photos
2. Drag and drop or click to upload
3. Preview shows all uploaded images

#### Step 3: Generate & Preview
1. System calculates script duration
2. Images are distributed evenly throughout video
3. Each image displays for 2 seconds with smooth transitions
4. AI voice narration plays over image slideshow
5. Captions appear synchronized with speech
6. Background music enhances the message

### Technical Process

The ad generation pipeline:

1. **Script Analysis**: Calculates duration based on word count (~2.5 words/second)
2. **Image Timing**: Distributes images evenly across video duration
3. **Audio Generation**: ElevenLabs converts script to speech
4. **Video Assembly**:
   - Uses base campaign video
   - Overlays uploaded images at calculated timestamps
   - Adds AI narration
   - Synchronizes captions
   - Mixes background music
5. **Export**: Final ad video ready for LinkedIn

### Use Cases

- **Product Launches**: Showcase new features with product images
- **Event Promotions**: Promote webinars, conferences, or workshops
- **Feature Announcements**: Highlight new capabilities with screenshots
- **Brand Awareness**: Share company culture and team photos
- **Lead Generation**: Create compelling offers with supporting visuals
- **Case Studies**: Showcase results with data visualizations

### Best Practices

#### Script Writing
- Start with a hook (first 3 seconds are critical)
- State the problem your product solves
- Present your solution clearly
- Include specific benefits (not just features)
- End with clear call-to-action

#### Image Selection
- Use high-resolution images (1080p+)
- Maintain consistent visual style
- Show your product in action when possible
- Include text overlays on images if needed
- Ensure images tell a story in sequence

#### Voice & Music
- Match voice tone to brand personality
- Professional voices work best for B2B
- Friendly voices work well for B2C
- Use background music to set the mood
- Keep music subtle (doesn't overpower narration)

### Example Ad Structure

**Caption**: "Transform Your Team's Productivity"

**Script**: "Tired of juggling multiple tools? GSOBA brings everything together in one platform. Manage projects, track time, and collaborate seamlessly. Join 10,000+ teams who've boosted productivity by 40%. Start your free trial today at GSOBA.com"

**Images**:
1. Problem: Stressed person with scattered tools
2. Solution: GSOBA dashboard interface
3. Benefits: Team collaborating happily
4. Results: Graph showing productivity increase
5. CTA: Sign-up page screenshot

This 30-second ad tells a complete story with visuals and narration working together.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- FFmpeg installed on your system
- API keys for all required services

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd CreatorStudio
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
OPEN_AI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
GEMINI_API_KEY=...
FAL_KEY=...
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
CreatorStudio/
├── app/
│   ├── api/                    # API routes
│   │   ├── audio/
│   │   │   └── transcribe/     # Audio transcription endpoint
│   │   ├── video/
│   │   │   ├── overlay/        # Main video generation endpoint
│   │   │   └── overlay-existing/
│   │   ├── generate-script/    # AI script generation
│   │   └── generate-image/     # AI image generation
│   ├── page.tsx                # Main app page
│   └── layout.tsx              # Root layout
├── components/
│   ├── wizard/                 # Video creation wizard
│   ├── studio/                 # Core studio components
│   │   ├── ScriptEditor.tsx    # AI script writer
│   │   ├── PostLibrary.tsx     # LinkedIn post browser
│   │   └── ImageGenerator.tsx  # Image generation interface
│   ├── forms/                  # Form components
│   └── ui/                     # UI components
├── lib/
│   ├── services/               # Backend services
│   │   ├── elevenlabs.service.ts   # Voice generation
│   │   ├── whisper.service.ts      # Transcription
│   │   ├── gemini-image.service.ts # Image generation
│   │   └── video-overlay.service.ts # Video assembly
│   └── constants/              # App constants
└── public/
    ├── generated-videos/       # Generated video outputs
    └── background-music/       # Music tracks
```

## Usage

### Creating a Video from Scratch

**Studio Mode** (for organic content):
1. Select **Studio Mode** in the main interface
2. Choose video type: **Text to Video**, **Image to Video**, or **Video to Video**
3. Enter or generate your script using the AI Script Writer
4. Select voice, music, and caption styles
5. Optionally add AI-generated images
6. Review and generate your video
7. Download and share

**Ad Mode** (for promotional content):
1. Select **Ad Mode** in the main interface
2. Enter your campaign details and product information
3. AI generates ad-focused scripts with compelling hooks
4. Customize creative elements to match your brand
5. Generate multiple variations for A/B testing
6. Download and launch your campaign

### Using the AI Script Writer

1. Enter a topic or idea (e.g., "5 product management tips")
2. AI generates a complete script with title, body, and hashtags
3. Edit the script using natural language commands
4. Send the final script to the video wizard

### Customization Options

- **Voices**: Select from multiple AI voice options for narration
- **Background Music**: Select from curated music tracks
- **Captions**: Customize font, size, color, and position
- **Images**: Generate up to 5 images per video

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Video Processing**: FFmpeg (fluent-ffmpeg)
- **AI Services**: OpenAI, ElevenLabs, Google Gemini, Fal.ai

## Development

### Build for Production

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## Performance Notes

- Videos are processed server-side for consistent quality
- Generated content is cached to reduce API costs
- Image generation is optional to save on API credits
- Audio files are reused when regenerating videos

### Video Generation Cost Optimization

**Current Approach**: The system uses a **5-second base video that loops** to match the audio duration. This significantly reduces costs:

- **Why**: Generating unique videos for every 30-60 second clip using Fal.ai would cost $0.10-0.20 per video
- **Solution**: Loop a single 5-second video template using FFmpeg (free)
- **Cost Savings**: ~$0.15 per video (85% reduction in video generation costs)
- **Result**: Total cost per video: ~$0.23 instead of ~$0.38

**Easy to Upgrade**: The architecture supports switching to full-length video generation:
- Simply modify the `video-generation.service.ts` to generate videos for full duration
- Enable Fal.ai image-to-video for each segment
- Generate unique motion for every scene
- Trade-off: Higher quality but 2x cost and longer generation time

**When to Use Each Approach**:
- **Looped Base Video** (Current): Perfect for most content, fast, cost-effective
- **Full Generation** (Available): Premium campaigns, high-budget ads, unique visuals needed

#### Real-World Cost Example

**Scenario**: Creating 20 LinkedIn videos per month

| Approach | Cost per Video | Monthly Cost | Annual Cost | Savings |
|----------|---------------|--------------|-------------|---------|
| **FFmpeg Loop** (Current) | $0.23 | **$4.60** | **$55.20** | Baseline |
| WAN v2.6 Flash | $0.26 | $5.20 | $62.40 | -$7.20/year |
| Stable Video | $0.31 | $6.20 | $74.40 | -$19.20/year |
| AnimateDiff | $0.38 | $7.60 | $91.20 | -$36.00/year |
| Runway Gen-2 | $0.43 | $8.60 | $103.20 | -$48.00/year |

**For 100 videos/month** (high-volume):
- FFmpeg Loop: $23/month ($276/year)
- WAN Flash: $26/month ($312/year)
- Stable Video: $31/month ($372/year)
- AnimateDiff: $38/month ($456/year)

**Recommendation**: Use FFmpeg loop for regular content, upgrade to WAN Flash or Stable Video for key campaigns where motion quality matters.

## Limitations

- Maximum script length: 3000 characters
- Minimum script length: 10 characters
- Video resolution: 416x752 (vertical format)
- Maximum 5 images per video

## Roadmap

- Support for horizontal video formats
- Batch video generation
- Video editing capabilities
- Custom brand templates
- Analytics and performance tracking
- Direct LinkedIn posting integration

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is private and proprietary.

## Support

For issues or questions, please open an issue on GitHub.
