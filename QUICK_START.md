# Quick Start Guide

Get up and running with Creator Studio in under 10 minutes.

## Prerequisites Check

Before starting, make sure you have:

- [ ] Node.js 18 or higher installed (`node --version`)
- [ ] FFmpeg installed (`ffmpeg -version`)
- [ ] Git installed
- [ ] Text editor (VS Code recommended)

## Installation

### 1. Install FFmpeg

**macOS**:
```bash
brew install ffmpeg
```

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows**:
Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH

Verify installation:
```bash
ffmpeg -version
```

### 2. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd CreatorStudio

# Install dependencies
npm install
```

### 3. Get API Keys

You'll need 4 API keys. Open these links and create accounts:

1. **OpenAI**: https://platform.openai.com/api-keys
   - Create account → API Keys → Create new secret key
   - Copy key starting with `sk-`

2. **ElevenLabs**: https://elevenlabs.io/app/settings/api-keys
   - Sign up → Settings → API Keys → Copy key

3. **Google Gemini**: https://makersuite.google.com/app/apikey
   - Sign in with Google → Get API Key → Create API Key

4. **Fal.ai**: https://fal.ai/dashboard/keys
   - Sign up → Dashboard → API Keys → Generate new key

### 4. Configure Environment

Create a `.env` file in the project root:

```bash
touch .env
```

Add your API keys:

```env
OPEN_AI_API_KEY=sk-your-openai-key-here
ELEVENLABS_API_KEY=your-elevenlabs-key-here
GEMINI_API_KEY=your-gemini-key-here
FAL_KEY=your-fal-key-here
```

**Important**: Never commit your `.env` file to Git!

### 5. Run the App

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

You should see the Creator Studio interface!

## Create Your First Video

### Option 1: Quick Video (Fastest)

1. Click on any post in the **Post Library** (left sidebar)
2. Click **"Send to Script Writer"**
3. Review the AI-generated video ideas
4. Click **"Create Script for This Idea"**
5. Click **"Use This Script"**
6. Go through the wizard (accept defaults)
7. Click **"Generate Video"**
8. Wait 30-60 seconds
9. Download your video!

### Option 2: Custom Script

1. Go to **Script Writer** (right sidebar)
2. Click a quick start prompt OR type your own topic
3. Review generated script
4. Click **"Use This Script"**
5. Customize voice, music, captions in the wizard
6. Optionally generate AI images
7. Generate and download

## Understanding the Interface

### Left Sidebar - Post Library
- Browse LinkedIn posts
- Send posts to Script Writer
- Import existing content

### Center - Video Creation
- **Studio Mode**: Create standard videos
- **Ad Mode**: Create campaign ads
- Three tabs:
  - Text to Video
  - Image to Video
  - Video to Video

### Right Sidebar - Script Writer
- AI-powered script generation
- Edit and refine scripts
- Quick start prompts
- Video idea generation

## Testing the Setup

Run this quick test to verify everything works:

```bash
# 1. Test API keys
curl -X POST http://localhost:3000/api/generate-script \
  -H "Content-Type: application/json" \
  -d '{"userInput":"Test prompt","masterPrompt":"Generate a short test script"}'

# Should return a JSON response with a script
```

If you get an error about API keys, check your `.env` file.

## Common Setup Issues

### "Module not found" error
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "FFmpeg not found"
```bash
# Verify FFmpeg is installed
which ffmpeg

# If not found, install it (see step 1 above)
```

### "API key error"
- Check `.env` file exists in project root
- Verify no extra spaces around `=` sign
- Ensure keys are on separate lines
- Restart dev server after changing `.env`

### Port 3000 already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill

# Or use a different port
PORT=3001 npm run dev
```

## Next Steps

### Customize Your Experience

1. **Adjust Script Writer**:
   - Click settings icon in Script Writer
   - Customize the master prompt
   - Save your changes

2. **Explore Voices**:
   - Step 3 in wizard shows all available voices
   - Preview each voice
   - Set your favorite as default

3. **Try Different Styles**:
   - Experiment with caption positioning
   - Test different fonts and colors
   - Try various background music tracks

### Learn More

- Read the full [README.md](./README.md) for feature overview
- Check [DOCUMENTATION.md](./DOCUMENTATION.md) for technical details
- Explore the code in `/components` and `/lib/services`

## Production Deployment

When ready to deploy:

```bash
# Build for production
npm run build

# Test production build locally
npm start

# Deploy to Vercel (recommended)
npx vercel

# Or deploy to your preferred platform
```

**Remember**: Set environment variables in your hosting platform's dashboard!

## Need Help?

- Check the [DOCUMENTATION.md](./DOCUMENTATION.md) troubleshooting section
- Review error messages in browser console and terminal
- Ensure all API keys have sufficient credits
- Verify FFmpeg is properly installed

## Video Generation Cost Estimate

### Current Implementation (Default)

Each video costs approximately:
- OpenAI (script + transcription): $0.03
- ElevenLabs (voice): $0.05
- Gemini (3 images): $0.15
- Fal.ai (video generation): **$0.00** (uses FFmpeg looping)
- **Total**: ~$0.23 per video

### With Fal.ai Video Generation (Optional)

If you enable full video generation with Fal.ai:
- OpenAI: $0.03
- ElevenLabs: $0.05
- Gemini (images): $0.15
- Fal.ai (video): $0.03-0.20 (depending on model)
- **Total**: ~$0.26-$0.43 per video

### Fal.ai Model Options

The system supports multiple Fal.ai models for image-to-video:

| Model | Speed | Quality | Cost/Gen | Best For |
|-------|-------|---------|----------|----------|
| **WAN v2.6 Flash** (default) | Fast | Good | $0.03 | High volume |
| Stable Video Diffusion | Medium | High | $0.08 | Marketing |
| AnimateDiff | Slow | Very High | $0.15 | Premium |
| Runway Gen-2 | Medium | Professional | $0.20 | Enterprise |

**Current Strategy**: Uses FFmpeg looping ($0.00) for base video, saving ~85% on video generation costs. Fal.ai models available for premium features.

### Free Tier Credits

Most API providers offer free credits to start:
- OpenAI: $5 free credit (~200 videos)
- ElevenLabs: 10,000 free characters (~20 videos)
- Google Gemini: Free tier available
- Fal.ai: $5 free credit (~150 videos with WAN Flash)

## Tips for Best Results

1. **Scripts**: Keep between 60-100 words for best pacing
2. **Images**: Use 2-3 images per video for visual variety
3. **Captions**: Bottom position works best for mobile viewing
4. **Music**: Choose tracks that match your content tone
5. **Voice**: Charlotte and Rachel are most natural for conversational content

## Development Workflow

```bash
# Start dev server
npm run dev

# In another terminal, watch for changes
npm run lint -- --fix

# Build to test production
npm run build

# Run production build
npm start
```

---

**You're all set!** 🎉

Start creating engaging videos for your LinkedIn content.

For questions or issues, open an issue on GitHub or check the documentation.
