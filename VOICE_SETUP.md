# Voice Setup Guide

## What Was Implemented

✅ **Voice Selection System**
- Dropdown with 6 ElevenLabs voices (Rachel, Bella, Domi, Adam, Antoni, Arnold)
- Voice preview buttons to hear samples before selecting
- Gender categories (male/female) with visual badges

✅ **Video Overlay Workflow**
- Takes existing `sample_falai_output.mp4` from `public/generated-videos/videos/`
- Generates audio narration using selected ElevenLabs voice
- Transcribes audio with OpenAI Whisper
- Overlays BOTH audio and captions on the video using ffmpeg
- Outputs final video to `public/generated-videos/final/`

✅ **API Endpoint**
- `POST /api/video/overlay` - Handles audio + caption overlay

## How To Use

1. **Write your script** in the text area
2. **Select a voice** using the voice selector dropdown
3. **Preview voices** by clicking the Play button
4. **Customize captions** with the caption customizer
5. **Click "Generate Video"** to overlay audio and captions on the sample video

## Adding Your Own Voices

Edit `/lib/constants/voices.ts` and add your voices to the `ELEVENLABS_VOICES` array:

```typescript
{
  id: 'voice_id_from_elevenlabs',
  name: 'Voice Name',
  description: 'Voice description',
  previewUrl: 'https://url-to-preview.mp3',
  category: 'male' | 'female' | 'neutral',
}
```

## Sample Voices Currently Included

- **Rachel** (Female) - Calm, young adult
- **Bella** (Female) - Soft, young adult
- **Domi** (Female) - Strong, young adult
- **Adam** (Male) - Deep, middle-aged
- **Antoni** (Male) - Well-rounded, young adult
- **Arnold** (Male) - Crisp, middle-aged

## File Structure

```
public/generated-videos/
├── audio/           # Generated audio files (.mp3)
├── transcripts/     # SRT subtitle files
├── videos/          # Input videos (sample_falai_output.mp4)
├── final/           # Output videos with audio + captions
└── uploads/         # User uploaded images (for future use)
```

## Requirements

- **ElevenLabs API Key** in `.env` as `ELEVENLABS_API_KEY`
- **OpenAI API Key** in `.env` as `OPEN_AI_API_KEY`
- **ffmpeg** installed on system (already verified ✓)
- **Sample video** at `public/generated-videos/videos/sample_falai_output.mp4` ✓

## Next Steps

1. Add your real ElevenLabs voice IDs and preview URLs
2. Test with different voices
3. Customize caption styles
4. Enjoy your AI-powered video creation! 🎬
